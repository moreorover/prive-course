import { relations, sql } from "drizzle-orm";
import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

import { user } from "./auth";

export type PublishStatus = "draft" | "published" | "archived";

const createdAt = integer("created_at", { mode: "timestamp_ms" })
  .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
  .notNull();

const updatedAt = integer("updated_at", { mode: "timestamp_ms" })
  .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
  .$onUpdate(() => /* @__PURE__ */ new Date())
  .notNull();

export const course = sqliteTable(
  "course",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    status: text("status").$type<PublishStatus>().default("draft").notNull(),
    createdAt,
    updatedAt,
  },
  (table) => [uniqueIndex("course_slug_unique").on(table.slug)],
);

export const lesson = sqliteTable(
  "lesson",
  {
    id: text("id").primaryKey(),
    courseId: text("course_id")
      .notNull()
      .references(() => course.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    position: integer("position").notNull(),
    videoUid: text("video_uid"),
    durationSeconds: integer("duration_seconds"),
    isFree: integer("is_free", { mode: "boolean" }).default(false).notNull(),
    status: text("status").$type<PublishStatus>().default("draft").notNull(),
    createdAt,
    updatedAt,
  },
  (table) => [
    index("lesson_courseId_idx").on(table.courseId),
    uniqueIndex("lesson_courseId_slug_unique").on(table.courseId, table.slug),
    index("lesson_courseId_position_idx").on(table.courseId, table.position),
  ],
);

export const courseAccess = sqliteTable(
  "course_access",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    courseId: text("course_id")
      .notNull()
      .references(() => course.id, { onDelete: "cascade" }),
    grantedByUserId: text("granted_by_user_id")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    grantedAt: integer("granted_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    revokedAt: integer("revoked_at", { mode: "timestamp_ms" }),
  },
  (table) => [
    uniqueIndex("course_access_userId_courseId_unique").on(table.userId, table.courseId),
    index("course_access_courseId_idx").on(table.courseId),
  ],
);

export const lessonProgress = sqliteTable(
  "lesson_progress",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    lessonId: text("lesson_id")
      .notNull()
      .references(() => lesson.id, { onDelete: "cascade" }),
    progressSeconds: integer("progress_seconds").default(0).notNull(),
    completedAt: integer("completed_at", { mode: "timestamp_ms" }),
    updatedAt,
  },
  (table) => [
    uniqueIndex("lesson_progress_userId_lessonId_unique").on(table.userId, table.lessonId),
  ],
);

export const playbackSession = sqliteTable(
  "playback_session",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    lessonId: text("lesson_id")
      .notNull()
      .references(() => lesson.id, { onDelete: "cascade" }),
    authSessionId: text("auth_session_id"),
    startedAt: integer("started_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    lastHeartbeatAt: integer("last_heartbeat_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [
    index("playback_session_userId_idx").on(table.userId),
    index("playback_session_lessonId_idx").on(table.lessonId),
  ],
);

export const courseRelations = relations(course, ({ many }) => ({
  lessons: many(lesson),
  access: many(courseAccess),
}));

export const lessonRelations = relations(lesson, ({ one, many }) => ({
  course: one(course, {
    fields: [lesson.courseId],
    references: [course.id],
  }),
  progress: many(lessonProgress),
  playbackSessions: many(playbackSession),
}));

export const courseAccessRelations = relations(courseAccess, ({ one }) => ({
  course: one(course, {
    fields: [courseAccess.courseId],
    references: [course.id],
  }),
  user: one(user, {
    fields: [courseAccess.userId],
    references: [user.id],
  }),
  grantedBy: one(user, {
    fields: [courseAccess.grantedByUserId],
    references: [user.id],
  }),
}));

export const lessonProgressRelations = relations(lessonProgress, ({ one }) => ({
  lesson: one(lesson, {
    fields: [lessonProgress.lessonId],
    references: [lesson.id],
  }),
  user: one(user, {
    fields: [lessonProgress.userId],
    references: [user.id],
  }),
}));

export const playbackSessionRelations = relations(playbackSession, ({ one }) => ({
  lesson: one(lesson, {
    fields: [playbackSession.lessonId],
    references: [lesson.id],
  }),
  user: one(user, {
    fields: [playbackSession.userId],
    references: [user.id],
  }),
}));
