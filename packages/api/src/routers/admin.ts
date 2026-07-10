import { course, courseAccess, lesson, user } from "@prive-course/db/schema";
import { TRPCError } from "@trpc/server";
import { and, asc, desc, eq, isNull, like, or } from "drizzle-orm";
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
