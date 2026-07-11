import {
  course,
  courseAccess,
  lesson,
  lessonProgress,
  playbackSession,
} from "@prive-course/db/schema";
import { env } from "@prive-course/env/server";
import { TRPCError } from "@trpc/server";
import { and, asc, eq, gt, inArray, isNull } from "drizzle-orm";
import { z } from "zod";

import { protectedProcedure, publicProcedure, router } from "../index";

const lessonSummaryColumns = {
  id: lesson.id,
  courseId: lesson.courseId,
  title: lesson.title,
  slug: lesson.slug,
  description: lesson.description,
  position: lesson.position,
  durationSeconds: lesson.durationSeconds,
  status: lesson.status,
};

async function assertCourseAccess(db: ContextDb, userId: string, courseId: string) {
  const access = await db
    .select({ id: courseAccess.id })
    .from(courseAccess)
    .where(
      and(
        eq(courseAccess.userId, userId),
        eq(courseAccess.courseId, courseId),
        isNull(courseAccess.revokedAt),
      ),
    )
    .limit(1);

  if (!access[0]) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Course access required",
    });
  }
}

type ContextDb = ReturnType<typeof import("@prive-course/db").createDb>;

const streamTokenResponseSchema = z.object({
  success: z.boolean(),
  errors: z.array(z.unknown()).default([]),
  result: z.object({
    token: z.string().min(1),
  }),
});

const playbackHeartbeatWindowMs = 90_000;
const playbackTokenTtlSeconds = 60 * 60;

async function getPublishedLessonForUser(db: ContextDb, userId: string, lessonId: string) {
  const rows = await db
    .select({
      lesson,
      course,
    })
    .from(lesson)
    .innerJoin(course, eq(course.id, lesson.courseId))
    .where(
      and(eq(lesson.id, lessonId), eq(lesson.status, "published"), eq(course.status, "published")),
    )
    .limit(1);

  const row = rows[0];
  if (!row) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Lesson not found",
    });
  }

  await assertCourseAccess(db, userId, row.course.id);

  return row;
}

function getAuthSessionId(session: { session?: { id?: string } }) {
  return session.session?.id ?? null;
}

export const courseRouter = router({
  listPublished: publicProcedure.query(async ({ ctx }) => {
    const courses = await ctx.db
      .select({
        id: course.id,
        title: course.title,
        slug: course.slug,
        description: course.description,
        status: course.status,
      })
      .from(course)
      .where(eq(course.status, "published"))
      .orderBy(asc(course.title));

    if (!ctx.session || courses.length === 0) {
      return courses.map((publishedCourse) => ({
        ...publishedCourse,
        hasActiveAccess: false,
        grantedAt: null,
      }));
    }

    const activeAccessRows = await ctx.db
      .select({
        courseId: courseAccess.courseId,
        grantedAt: courseAccess.grantedAt,
      })
      .from(courseAccess)
      .where(
        and(
          eq(courseAccess.userId, ctx.session.user.id),
          inArray(
            courseAccess.courseId,
            courses.map((publishedCourse) => publishedCourse.id),
          ),
          isNull(courseAccess.revokedAt),
        ),
      )
      .orderBy(asc(courseAccess.grantedAt));
    const activeAccessByCourseId = new Map(
      activeAccessRows.map((access) => [access.courseId, access.grantedAt]),
    );

    return courses.map((publishedCourse) => {
      const grantedAt = activeAccessByCourseId.get(publishedCourse.id) ?? null;

      return {
        ...publishedCourse,
        hasActiveAccess: grantedAt !== null,
        grantedAt,
      };
    });
  }),

  listGranted: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db
      .select({
        id: course.id,
        title: course.title,
        slug: course.slug,
        description: course.description,
        status: course.status,
        grantedAt: courseAccess.grantedAt,
      })
      .from(courseAccess)
      .innerJoin(course, eq(course.id, courseAccess.courseId))
      .where(
        and(
          eq(courseAccess.userId, ctx.session.user.id),
          isNull(courseAccess.revokedAt),
          eq(course.status, "published"),
        ),
      )
      .orderBy(asc(course.title));
  }),

  bySlug: protectedProcedure
    .input(z.object({ slug: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const rows = await ctx.db
        .select()
        .from(course)
        .where(and(eq(course.slug, input.slug), eq(course.status, "published")))
        .limit(1);
      const foundCourse = rows[0];

      if (!foundCourse) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Course not found",
        });
      }

      await assertCourseAccess(ctx.db, ctx.session.user.id, foundCourse.id);

      const lessons = await ctx.db
        .select(lessonSummaryColumns)
        .from(lesson)
        .where(and(eq(lesson.courseId, foundCourse.id), eq(lesson.status, "published")))
        .orderBy(asc(lesson.position));

      return {
        ...foundCourse,
        lessons,
      };
    }),

  lessonBySlug: protectedProcedure
    .input(
      z.object({
        courseSlug: z.string().min(1),
        lessonSlug: z.string().min(1),
      }),
    )
    .query(async ({ ctx, input }) => {
      const rows = await ctx.db
        .select({
          course,
          lesson,
          progress: lessonProgress,
        })
        .from(lesson)
        .innerJoin(course, eq(course.id, lesson.courseId))
        .leftJoin(
          lessonProgress,
          and(
            eq(lessonProgress.lessonId, lesson.id),
            eq(lessonProgress.userId, ctx.session.user.id),
          ),
        )
        .where(
          and(
            eq(course.slug, input.courseSlug),
            eq(course.status, "published"),
            eq(lesson.slug, input.lessonSlug),
            eq(lesson.status, "published"),
          ),
        )
        .limit(1);

      const row = rows[0];
      if (!row) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Lesson not found",
        });
      }

      await assertCourseAccess(ctx.db, ctx.session.user.id, row.course.id);

      return row;
    }),

  updateProgress: protectedProcedure
    .input(
      z.object({
        lessonId: z.string().min(1),
        progressSeconds: z.number().int().nonnegative(),
        completed: z.boolean().default(false),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await getPublishedLessonForUser(ctx.db, ctx.session.user.id, input.lessonId);

      const existingProgress = await ctx.db
        .select({
          id: lessonProgress.id,
          progressSeconds: lessonProgress.progressSeconds,
          completedAt: lessonProgress.completedAt,
        })
        .from(lessonProgress)
        .where(
          and(
            eq(lessonProgress.userId, ctx.session.user.id),
            eq(lessonProgress.lessonId, input.lessonId),
          ),
        )
        .limit(1);
      const progressSeconds = Math.max(
        existingProgress[0]?.progressSeconds ?? 0,
        input.progressSeconds,
      );
      const completedAt = input.completed ? new Date() : (existingProgress[0]?.completedAt ?? null);

      if (existingProgress[0]) {
        await ctx.db
          .update(lessonProgress)
          .set({
            progressSeconds,
            completedAt,
            updatedAt: new Date(),
          })
          .where(eq(lessonProgress.id, existingProgress[0].id));
      } else {
        await ctx.db.insert(lessonProgress).values({
          id: crypto.randomUUID(),
          userId: ctx.session.user.id,
          lessonId: input.lessonId,
          progressSeconds,
          completedAt,
        });
      }

      const progressRows = await ctx.db
        .select()
        .from(lessonProgress)
        .where(
          and(
            eq(lessonProgress.userId, ctx.session.user.id),
            eq(lessonProgress.lessonId, input.lessonId),
          ),
        )
        .limit(1);

      return progressRows[0];
    }),

  createPlaybackToken: protectedProcedure
    .input(z.object({ lessonId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const row = await getPublishedLessonForUser(ctx.db, ctx.session.user.id, input.lessonId);

      if (!row.lesson.videoUid) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Lesson video is not uploaded",
        });
      }

      if (!env.CLOUDFLARE_ACCOUNT_ID || !env.CLOUDFLARE_STREAM_API_TOKEN) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Cloudflare Stream credentials are not configured",
        });
      }

      const authSessionId = getAuthSessionId(ctx.session);
      const now = new Date();
      const heartbeatCutoff = new Date(Date.now() - playbackHeartbeatWindowMs);
      const activeSessions = await ctx.db
        .select({
          id: playbackSession.id,
          authSessionId: playbackSession.authSessionId,
        })
        .from(playbackSession)
        .where(
          and(
            eq(playbackSession.userId, ctx.session.user.id),
            gt(playbackSession.expiresAt, now),
            gt(playbackSession.lastHeartbeatAt, heartbeatCutoff),
          ),
        );

      const conflictingSession = activeSessions.find(
        (session) => session.authSessionId !== authSessionId,
      );

      if (conflictingSession) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "This account is already playing a lesson in another session",
        });
      }

      const tokenExpiresAt = new Date(Date.now() + playbackTokenTtlSeconds * 1000);
      const response = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/stream/${row.lesson.videoUid}/token`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${env.CLOUDFLARE_STREAM_API_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            exp: Math.floor(tokenExpiresAt.getTime() / 1000),
          }),
        },
      );
      const body = await response.json();
      const payload = streamTokenResponseSchema.safeParse(body);

      if (!response.ok || !payload.success || !payload.data.success) {
        throw new TRPCError({
          code: "BAD_GATEWAY",
          message: "Failed to create Cloudflare Stream playback token",
        });
      }

      const playbackSessionId = crypto.randomUUID();
      await ctx.db.insert(playbackSession).values({
        id: playbackSessionId,
        userId: ctx.session.user.id,
        lessonId: input.lessonId,
        authSessionId,
        lastHeartbeatAt: now,
        expiresAt: new Date(Date.now() + playbackHeartbeatWindowMs),
      });

      return {
        playbackSessionId,
        token: payload.data.result.token,
        iframeUrl: `https://iframe.videodelivery.net/${payload.data.result.token}`,
        tokenExpiresAt,
        heartbeatExpiresAt: new Date(Date.now() + playbackHeartbeatWindowMs),
      };
    }),

  heartbeatPlayback: protectedProcedure
    .input(z.object({ playbackSessionId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const rows = await ctx.db
        .select()
        .from(playbackSession)
        .where(
          and(
            eq(playbackSession.id, input.playbackSessionId),
            eq(playbackSession.userId, ctx.session.user.id),
          ),
        )
        .limit(1);
      const foundSession = rows[0];

      if (!foundSession) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Playback session not found",
        });
      }

      const authSessionId = getAuthSessionId(ctx.session);
      if (foundSession.authSessionId !== authSessionId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Playback session belongs to another auth session",
        });
      }

      const now = new Date();
      const expiresAt = new Date(Date.now() + playbackHeartbeatWindowMs);
      await ctx.db
        .update(playbackSession)
        .set({
          lastHeartbeatAt: now,
          expiresAt,
        })
        .where(eq(playbackSession.id, input.playbackSessionId));

      return {
        playbackSessionId: input.playbackSessionId,
        heartbeatAt: now,
        expiresAt,
      };
    }),
});
