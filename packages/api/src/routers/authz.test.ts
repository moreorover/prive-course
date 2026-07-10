import type { Context } from "../context";
import { appRouter } from "./index";
import { describe, expect, it, vi } from "vitest";

vi.mock("@prive-course/env/server", () => ({
  env: {
    CLOUDFLARE_ACCOUNT_ID: "account-id",
    CLOUDFLARE_STREAM_API_TOKEN: "stream-token",
  },
}));

type Session = NonNullable<Context["session"]>;

class QueryResult<T> {
  constructor(private readonly result: T) {}

  from() {
    return this;
  }

  innerJoin() {
    return this;
  }

  leftJoin() {
    return this;
  }

  where() {
    return this;
  }

  orderBy() {
    return this;
  }

  limit() {
    return Promise.resolve(this.result);
  }

  find(predicate: (value: T extends Array<infer Item> ? Item : never) => boolean) {
    return Array.isArray(this.result) ? this.result.find(predicate) : undefined;
  }
}

function createMockDb(results: unknown[]) {
  return {
    select: vi.fn(() => new QueryResult(results.shift() ?? [])),
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
  results?: unknown[];
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

  it("rejects course detail access without a manual course grant", async () => {
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
      ],
    });

    await expect(caller.courses.bySlug({ slug: "course" })).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
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
