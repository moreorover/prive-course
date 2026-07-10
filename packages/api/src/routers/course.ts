import { course, courseAccess, lesson, lessonProgress } from "@prive-course/db/schema";
import { TRPCError } from "@trpc/server";
import { and, asc, eq, isNull } from "drizzle-orm";
import { z } from "zod";

import { protectedProcedure, router } from "../index";

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

export const courseRouter = router({
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
      const rows = await ctx.db
        .select({
          lesson,
          course,
        })
        .from(lesson)
        .innerJoin(course, eq(course.id, lesson.courseId))
        .where(
          and(
            eq(lesson.id, input.lessonId),
            eq(lesson.status, "published"),
            eq(course.status, "published"),
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

      const completedAt = input.completed ? new Date() : null;
      const existingProgress = await ctx.db
        .select({ id: lessonProgress.id })
        .from(lessonProgress)
        .where(
          and(
            eq(lessonProgress.userId, ctx.session.user.id),
            eq(lessonProgress.lessonId, input.lessonId),
          ),
        )
        .limit(1);

      if (existingProgress[0]) {
        await ctx.db
          .update(lessonProgress)
          .set({
            progressSeconds: input.progressSeconds,
            completedAt,
            updatedAt: new Date(),
          })
          .where(eq(lessonProgress.id, existingProgress[0].id));
      } else {
        await ctx.db.insert(lessonProgress).values({
          id: crypto.randomUUID(),
          userId: ctx.session.user.id,
          lessonId: input.lessonId,
          progressSeconds: input.progressSeconds,
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
});
