import { course, courseAccess, lesson, user } from "@prive-course/db/schema";
import { env } from "@prive-course/env/server";
import { TRPCError } from "@trpc/server";
import { and, asc, desc, eq, inArray, isNull, like, or } from "drizzle-orm";
import { z } from "zod";

import { adminProcedure, router } from "../index";

const publishStatusSchema = z.enum(["draft", "published", "archived"]);

const slugSchema = z
  .string()
  .trim()
  .min(1)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens");

const optionalTextSchema = z
  .string()
  .trim()
  .max(4000)
  .optional()
  .transform((value) => (value ? value : null));

const courseInputSchema = z.object({
  title: z.string().trim().min(1).max(180),
  slug: slugSchema,
  description: optionalTextSchema,
  status: publishStatusSchema.default("draft"),
});

const lessonInputSchema = z.object({
  courseId: z.string().min(1),
  title: z.string().trim().min(1).max(180),
  slug: slugSchema,
  description: optionalTextSchema,
  position: z.number().int().min(0),
  videoUid: z
    .string()
    .trim()
    .max(200)
    .optional()
    .transform((value) => (value ? value : null)),
  durationSeconds: z.number().int().nonnegative().nullable().optional(),
  status: publishStatusSchema.default("draft"),
});

const streamDirectUploadResponseSchema = z.object({
  success: z.boolean(),
  errors: z.array(z.unknown()).default([]),
  result: z.object({
    uploadURL: z.string().url(),
    uid: z.string().min(1),
  }),
});

async function getCourseOrThrow(db: ContextDb, courseId: string) {
  const rows = await db.select().from(course).where(eq(course.id, courseId)).limit(1);
  const foundCourse = rows[0];

  if (!foundCourse) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Course not found",
    });
  }

  return foundCourse;
}

type ContextDb = ReturnType<typeof import("@prive-course/db").createDb>;

async function getLessonOrThrow(db: ContextDb, lessonId: string) {
  const rows = await db.select().from(lesson).where(eq(lesson.id, lessonId)).limit(1);
  const foundLesson = rows[0];

  if (!foundLesson) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Lesson not found",
    });
  }

  return foundLesson;
}

export const adminRouter = router({
  listCourses: adminProcedure.query(({ ctx }) => {
    return ctx.db.select().from(course).orderBy(desc(course.updatedAt));
  }),

  getCourse: adminProcedure.input(z.object({ id: z.string().min(1) })).query(({ ctx, input }) => {
    return getCourseOrThrow(ctx.db, input.id);
  }),

  createCourse: adminProcedure.input(courseInputSchema).mutation(async ({ ctx, input }) => {
    const id = crypto.randomUUID();

    await ctx.db.insert(course).values({
      id,
      ...input,
    });

    return getCourseOrThrow(ctx.db, id);
  }),

  updateCourse: adminProcedure
    .input(courseInputSchema.partial().extend({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...changes } = input;
      await getCourseOrThrow(ctx.db, id);

      await ctx.db
        .update(course)
        .set({
          ...changes,
          updatedAt: new Date(),
        })
        .where(eq(course.id, id));

      return getCourseOrThrow(ctx.db, id);
    }),

  listLessons: adminProcedure
    .input(z.object({ courseId: z.string().min(1) }))
    .query(({ ctx, input }) => {
      return ctx.db
        .select()
        .from(lesson)
        .where(eq(lesson.courseId, input.courseId))
        .orderBy(asc(lesson.position));
    }),

  getLesson: adminProcedure.input(z.object({ id: z.string().min(1) })).query(({ ctx, input }) => {
    return getLessonOrThrow(ctx.db, input.id);
  }),

  createLesson: adminProcedure.input(lessonInputSchema).mutation(async ({ ctx, input }) => {
    await getCourseOrThrow(ctx.db, input.courseId);

    const id = crypto.randomUUID();
    await ctx.db.insert(lesson).values({
      id,
      durationSeconds: input.durationSeconds ?? null,
      ...input,
    });

    const rows = await ctx.db.select().from(lesson).where(eq(lesson.id, id)).limit(1);
    return rows[0];
  }),

  updateLesson: adminProcedure
    .input(lessonInputSchema.partial().extend({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...changes } = input;

      await ctx.db
        .update(lesson)
        .set({
          ...changes,
          updatedAt: new Date(),
        })
        .where(eq(lesson.id, id));

      const rows = await ctx.db.select().from(lesson).where(eq(lesson.id, id)).limit(1);
      const foundLesson = rows[0];

      if (!foundLesson) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Lesson not found",
        });
      }

      return foundLesson;
    }),

  reorderLessons: adminProcedure
    .input(
      z.object({
        courseId: z.string().min(1),
        lessonIds: z.array(z.string().min(1)).min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await getCourseOrThrow(ctx.db, input.courseId);

      const uniqueLessonIds = new Set(input.lessonIds);
      if (uniqueLessonIds.size !== input.lessonIds.length) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Lesson order contains duplicate lessons",
        });
      }

      const existingLessons = await ctx.db
        .select({ id: lesson.id })
        .from(lesson)
        .where(and(eq(lesson.courseId, input.courseId), inArray(lesson.id, input.lessonIds)));

      if (existingLessons.length !== input.lessonIds.length) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Lesson order contains lessons outside this course",
        });
      }

      for (const [position, lessonId] of input.lessonIds.entries()) {
        await ctx.db
          .update(lesson)
          .set({ position, updatedAt: new Date() })
          .where(and(eq(lesson.id, lessonId), eq(lesson.courseId, input.courseId)));
      }

      return ctx.db
        .select()
        .from(lesson)
        .where(eq(lesson.courseId, input.courseId))
        .orderBy(asc(lesson.position));
    }),

  createLessonUploadUrl: adminProcedure
    .input(
      z.object({
        lessonId: z.string().min(1),
        maxDurationSeconds: z.number().int().positive().max(86_400).default(3600),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const foundLesson = await getLessonOrThrow(ctx.db, input.lessonId);
      await getCourseOrThrow(ctx.db, foundLesson.courseId);

      if (!env.CLOUDFLARE_ACCOUNT_ID || !env.CLOUDFLARE_STREAM_API_TOKEN) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Cloudflare Stream credentials are not configured",
        });
      }

      const response = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/stream/direct_upload`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${env.CLOUDFLARE_STREAM_API_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            maxDurationSeconds: input.maxDurationSeconds,
          }),
        },
      );
      const body = await response.json();
      const payload = streamDirectUploadResponseSchema.safeParse(body);

      if (!response.ok || !payload.success || !payload.data.success) {
        throw new TRPCError({
          code: "BAD_GATEWAY",
          message: "Failed to create Cloudflare Stream upload URL",
        });
      }

      await ctx.db
        .update(lesson)
        .set({
          videoUid: payload.data.result.uid,
          updatedAt: new Date(),
        })
        .where(eq(lesson.id, input.lessonId));

      return payload.data.result;
    }),

  searchUsers: adminProcedure
    .input(z.object({ query: z.string().trim().default("") }))
    .query(({ ctx, input }) => {
      const pattern = `%${input.query}%`;

      return ctx.db
        .select({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          banned: user.banned,
          createdAt: user.createdAt,
        })
        .from(user)
        .where(input.query ? or(like(user.email, pattern), like(user.name, pattern)) : undefined)
        .orderBy(asc(user.email))
        .limit(25);
    }),

  listCourseAccess: adminProcedure
    .input(z.object({ courseId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      await getCourseOrThrow(ctx.db, input.courseId);

      return ctx.db
        .select({
          id: courseAccess.id,
          userId: courseAccess.userId,
          courseId: courseAccess.courseId,
          grantedAt: courseAccess.grantedAt,
          userName: user.name,
          userEmail: user.email,
          userRole: user.role,
          userBanned: user.banned,
        })
        .from(courseAccess)
        .innerJoin(user, eq(user.id, courseAccess.userId))
        .where(and(eq(courseAccess.courseId, input.courseId), isNull(courseAccess.revokedAt)))
        .orderBy(asc(user.email));
    }),

  grantCourseAccess: adminProcedure
    .input(
      z.object({
        userId: z.string().min(1),
        courseId: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await getCourseOrThrow(ctx.db, input.courseId);

      const existing = await ctx.db
        .select()
        .from(courseAccess)
        .where(
          and(eq(courseAccess.userId, input.userId), eq(courseAccess.courseId, input.courseId)),
        )
        .limit(1);

      if (existing[0]) {
        await ctx.db
          .update(courseAccess)
          .set({
            grantedByUserId: ctx.session.user.id,
            grantedAt: new Date(),
            revokedAt: null,
          })
          .where(eq(courseAccess.id, existing[0].id));
        return { id: existing[0].id };
      }

      const id = crypto.randomUUID();
      await ctx.db.insert(courseAccess).values({
        id,
        userId: input.userId,
        courseId: input.courseId,
        grantedByUserId: ctx.session.user.id,
      });

      return { id };
    }),

  revokeCourseAccess: adminProcedure
    .input(
      z.object({
        userId: z.string().min(1),
        courseId: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(courseAccess)
        .set({ revokedAt: new Date() })
        .where(
          and(
            eq(courseAccess.userId, input.userId),
            eq(courseAccess.courseId, input.courseId),
            isNull(courseAccess.revokedAt),
          ),
        );

      return { revoked: true };
    }),
});
