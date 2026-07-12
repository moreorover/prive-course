import type { Context } from "../context";
import { appRouter } from "./index";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@prive-course/env/server", () => ({
  env: {
    CLOUDFLARE_ACCOUNT_ID: "account-id",
    CLOUDFLARE_STREAM_API_TOKEN: "stream-token",
  },
}));

afterEach(() => {
  vi.unstubAllGlobals();
});

type Session = NonNullable<Context["session"]>;

class QueryResult<T> {
  private didCallWhere = false;

  constructor(
    private readonly result: T,
    private readonly options: { expectedWhereTokens?: string[]; requireWhere?: boolean } = {},
  ) {}

  from() {
    return this;
  }

  innerJoin() {
    return this;
  }

  leftJoin() {
    return this;
  }

  where(condition?: unknown) {
    this.didCallWhere = true;
    const conditionTokens = collectSqlConditionTokens(condition);

    for (const expectedToken of this.options.expectedWhereTokens ?? []) {
      if (!conditionTokens.includes(expectedToken)) {
        throw new Error(`Expected where clause to include ${expectedToken}`);
      }
    }

    return this;
  }

  orderBy() {
    if (this.options.requireWhere && !this.didCallWhere) {
      throw new Error("Expected query to include a where clause");
    }
    return Promise.resolve(this.result);
  }

  limit() {
    return Promise.resolve(this.result);
  }

  find(predicate: (value: T extends Array<infer Item> ? Item : never) => boolean) {
    return Array.isArray(this.result) ? this.result.find(predicate) : undefined;
  }
}

class MutationResult {
  set() {
    return this;
  }

  where() {
    return Promise.resolve([]);
  }

  values() {
    return Promise.resolve([]);
  }
}

type MockQueryResult =
  | unknown[]
  | { expectedWhereTokens?: string[]; result: unknown[]; requireWhere?: boolean };

function collectSqlConditionTokens(condition: unknown): string[] {
  if (!condition || typeof condition !== "object") {
    return [];
  }

  const chunks = (condition as { queryChunks?: unknown[] }).queryChunks;
  if (!chunks) {
    return [];
  }

  return chunks.flatMap((chunk) => {
    if (typeof chunk === "string") {
      return [chunk];
    }

    if (!chunk || typeof chunk !== "object") {
      return [];
    }

    const namedChunk = chunk as { name?: unknown; queryChunks?: unknown[]; value?: unknown };

    if (typeof namedChunk.name === "string") {
      return [namedChunk.name];
    }

    if (Array.isArray(namedChunk.value)) {
      return namedChunk.value.filter((value): value is string => typeof value === "string");
    }

    if (typeof namedChunk.value === "string") {
      return [namedChunk.value];
    }

    if (Array.isArray(namedChunk.queryChunks)) {
      return collectSqlConditionTokens(namedChunk);
    }

    return [];
  });
}

function createMockDb(results: MockQueryResult[]) {
  return {
    select: vi.fn(() => {
      const nextResult = results.shift() ?? [];

      if (Array.isArray(nextResult)) {
        return new QueryResult(nextResult);
      }

      return new QueryResult(nextResult.result, {
        expectedWhereTokens: nextResult.expectedWhereTokens,
        requireWhere: nextResult.requireWhere,
      });
    }),
    insert: vi.fn(() => new MutationResult()),
    update: vi.fn(() => new MutationResult()),
  };
}

function createSession(role: "admin" | "user", id = "user-id"): Session {
  return {
    session: {
      id: "auth-session-id",
    },
    user: {
      id,
      role,
    },
  } as Session;
}

function createCaller({
  results = [],
  session,
}: {
  results?: MockQueryResult[];
  session: Context["session"];
}) {
  return appRouter.createCaller({
    auth: null,
    db: createMockDb(results),
    session,
  } as unknown as Context);
}

describe("API authorization boundaries", () => {
  it("requires authentication for protected routes", async () => {
    const caller = createCaller({ session: null });

    await expect(caller.privateData()).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });

  it("rejects non-admin users from admin routes", async () => {
    const caller = createCaller({ session: createSession("user") });

    await expect(caller.admin.listCourses()).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });

  it("rejects manual video UID changes through lesson creation", async () => {
    const caller = createCaller({
      session: createSession("admin"),
      results: [
        [
          {
            id: "course-id",
          },
        ],
        [
          {
            id: "lesson-id",
            courseId: "course-id",
            title: "Lesson",
            slug: "lesson",
            videoUid: "manual-video-uid",
          },
        ],
      ],
    });

    await expect(
      caller.admin.createLesson({
        courseId: "course-id",
        title: "Lesson",
        slug: "lesson",
        description: "",
        position: 0,
        durationSeconds: null,
        isFree: false,
        status: "draft",
        videoUid: "manual-video-uid",
      }),
    ).rejects.toThrow();
  });

  it("rejects manual video UID changes through lesson updates", async () => {
    const caller = createCaller({
      session: createSession("admin"),
      results: [
        [
          {
            id: "lesson-id",
            videoUid: "manual-video-uid",
          },
        ],
      ],
    });

    await expect(
      caller.admin.updateLesson({
        id: "lesson-id",
        videoUid: "manual-video-uid",
      }),
    ).rejects.toThrow();
  });

  it("allows signed-in users without a manual course grant to open published course detail", async () => {
    const caller = createCaller({
      session: createSession("user"),
      results: [
        [
          {
            id: "course-id",
            slug: "course",
            status: "published",
          },
        ],
        [],
        [],
      ],
    });

    await expect(caller.courses.bySlug({ slug: "course" })).resolves.toEqual(
      expect.objectContaining({
        id: "course-id",
        hasActiveAccess: false,
        grantedAt: null,
        lessons: [],
      }),
    );
  });

  it("allows guests to list published course summaries", async () => {
    const caller = createCaller({
      session: null,
      results: [
        {
          expectedWhereTokens: ["status", "published"],
          requireWhere: true,
          result: [
            {
              id: "published-course-id",
              title: "Published Course",
              slug: "published-course",
              description: "Visible to guests",
              status: "published",
            },
          ],
        },
      ],
    });

    await expect(caller.courses.listPublished()).resolves.toEqual([
      {
        id: "published-course-id",
        title: "Published Course",
        slug: "published-course",
        description: "Visible to guests",
        status: "published",
        hasActiveAccess: false,
        grantedAt: null,
      },
    ]);
  });

  it("does not expose draft or archived courses in the guest catalog", async () => {
    const caller = createCaller({
      session: null,
      results: [
        {
          expectedWhereTokens: ["status", "published"],
          requireWhere: true,
          result: [
            {
              id: "published-course-id",
              title: "Published Course",
              slug: "published-course",
              description: null,
              status: "published",
            },
          ],
        },
      ],
    });

    await expect(caller.courses.listPublished()).resolves.toEqual([
      expect.objectContaining({
        id: "published-course-id",
        status: "published",
      }),
    ]);
  });

  it("includes active course access state for signed-in users", async () => {
    const grantedAt = new Date("2026-07-11T12:00:00.000Z");
    const caller = createCaller({
      session: createSession("user"),
      results: [
        {
          expectedWhereTokens: ["status", "published"],
          requireWhere: true,
          result: [
            {
              id: "published-course-id",
              title: "Published Course",
              slug: "published-course",
              description: null,
              status: "published",
            },
          ],
        },
        {
          expectedWhereTokens: ["user_id", "user-id", "course_id", "revoked_at", " is null"],
          requireWhere: true,
          result: [{ courseId: "published-course-id", grantedAt }],
        },
      ],
    });

    await expect(caller.courses.listPublished()).resolves.toEqual([
      expect.objectContaining({
        id: "published-course-id",
        hasActiveAccess: true,
        grantedAt,
      }),
    ]);
  });

  it("does not treat revoked course access as active", async () => {
    const caller = createCaller({
      session: createSession("user"),
      results: [
        {
          expectedWhereTokens: ["status", "published"],
          requireWhere: true,
          result: [
            {
              id: "published-course-id",
              title: "Published Course",
              slug: "published-course",
              description: null,
              status: "published",
            },
          ],
        },
        {
          expectedWhereTokens: ["user_id", "user-id", "course_id", "revoked_at", " is null"],
          requireWhere: true,
          result: [],
        },
      ],
    });

    await expect(caller.courses.listPublished()).resolves.toEqual([
      expect.objectContaining({
        id: "published-course-id",
        hasActiveAccess: false,
        grantedAt: null,
      }),
    ]);
  });

  it("allows guests to open published course detail with free and locked lesson metadata", async () => {
    const caller = createCaller({
      session: null,
      results: [
        [
          {
            id: "course-id",
            title: "Published Course",
            slug: "course",
            description: "Visible detail",
            status: "published",
          },
        ],
        [
          {
            id: "free-lesson-id",
            courseId: "course-id",
            title: "Free Lesson",
            slug: "free-lesson",
            description: null,
            position: 0,
            durationSeconds: 120,
            status: "published",
            isFree: true,
          },
          {
            id: "paid-lesson-id",
            courseId: "course-id",
            title: "Paid Lesson",
            slug: "paid-lesson",
            description: null,
            position: 1,
            durationSeconds: 180,
            status: "published",
            isFree: false,
          },
        ],
      ],
    });

    await expect(caller.courses.bySlug({ slug: "course" })).resolves.toEqual(
      expect.objectContaining({
        id: "course-id",
        hasActiveAccess: false,
        grantedAt: null,
        lessons: [
          expect.objectContaining({ id: "free-lesson-id", isFree: true }),
          expect.objectContaining({ id: "paid-lesson-id", isFree: false }),
        ],
      }),
    );
  });

  it("allows guests to open published free lesson detail", async () => {
    const caller = createCaller({
      session: null,
      results: [
        [
          {
            course: {
              id: "course-id",
              title: "Published Course",
              slug: "course",
              status: "published",
            },
            lesson: {
              id: "free-lesson-id",
              courseId: "course-id",
              title: "Free Lesson",
              slug: "free-lesson",
              status: "published",
              isFree: true,
              videoUid: "video-uid",
            },
            progress: null,
          },
        ],
      ],
    });

    await expect(
      caller.courses.lessonBySlug({ courseSlug: "course", lessonSlug: "free-lesson" }),
    ).resolves.toEqual(
      expect.objectContaining({
        lesson: expect.objectContaining({ id: "free-lesson-id", isFree: true }),
        progress: null,
      }),
    );
  });

  it("rejects guest access to published paid lesson detail", async () => {
    const caller = createCaller({
      session: null,
      results: [
        [
          {
            course: {
              id: "course-id",
              title: "Published Course",
              slug: "course",
              status: "published",
            },
            lesson: {
              id: "paid-lesson-id",
              courseId: "course-id",
              title: "Paid Lesson",
              slug: "paid-lesson",
              status: "published",
              isFree: false,
              videoUid: "video-uid",
            },
            progress: null,
          },
        ],
      ],
    });

    await expect(
      caller.courses.lessonBySlug({ courseSlug: "course", lessonSlug: "paid-lesson" }),
    ).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });

  it("allows guests to create playback tokens for published free lessons without playback sessions", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          success: true,
          result: {
            token: "signed-stream-token",
          },
        }),
        { status: 200 },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);
    const caller = createCaller({
      session: null,
      results: [
        [
          {
            course: {
              id: "course-id",
              status: "published",
            },
            lesson: {
              id: "free-lesson-id",
              courseId: "course-id",
              status: "published",
              isFree: true,
              videoUid: "video-uid",
            },
          },
        ],
      ],
    });

    await expect(
      caller.courses.createPlaybackToken({ lessonId: "free-lesson-id" }),
    ).resolves.toEqual(
      expect.objectContaining({
        playbackSessionId: null,
        token: "signed-stream-token",
        iframeUrl: "https://iframe.videodelivery.net/signed-stream-token",
      }),
    );
  });

  it("allows signed-in users to save progress for published free lessons without a course grant", async () => {
    const caller = createCaller({
      session: createSession("user"),
      results: [
        [
          {
            course: {
              id: "course-id",
              status: "published",
            },
            lesson: {
              id: "free-lesson-id",
              courseId: "course-id",
              status: "published",
              isFree: true,
              videoUid: "video-uid",
            },
          },
        ],
        [],
        [
          {
            id: "progress-id",
            userId: "user-id",
            lessonId: "free-lesson-id",
            progressSeconds: 30,
            completedAt: null,
          },
        ],
      ],
    });

    await expect(
      caller.courses.updateProgress({
        lessonId: "free-lesson-id",
        progressSeconds: 30,
        completed: false,
      }),
    ).resolves.toEqual(
      expect.objectContaining({
        lessonId: "free-lesson-id",
        progressSeconds: 30,
      }),
    );
  });

  it("rejects playback token creation without a manual course grant", async () => {
    const caller = createCaller({
      session: createSession("user"),
      results: [
        [
          {
            course: {
              id: "course-id",
              status: "published",
            },
            lesson: {
              id: "lesson-id",
              courseId: "course-id",
              status: "published",
              videoUid: "video-uid",
            },
          },
        ],
        [],
      ],
    });

    await expect(
      caller.courses.createPlaybackToken({ lessonId: "lesson-id" }),
    ).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });

  it("rejects playback when the user already has an active auth session elsewhere", async () => {
    const caller = createCaller({
      session: createSession("user"),
      results: [
        [
          {
            course: {
              id: "course-id",
              status: "published",
            },
            lesson: {
              id: "lesson-id",
              courseId: "course-id",
              status: "published",
              videoUid: "video-uid",
            },
          },
        ],
        [{ id: "access-id" }],
        [{ id: "playback-session-id", authSessionId: "another-auth-session-id" }],
      ],
    });

    await expect(
      caller.courses.createPlaybackToken({ lessonId: "lesson-id" }),
    ).rejects.toMatchObject({
      code: "CONFLICT",
    });
  });
});
