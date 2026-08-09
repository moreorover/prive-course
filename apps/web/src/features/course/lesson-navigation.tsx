import { Badge, Button, Text, Title } from "@mantine/core";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { LessonRow } from "@/components/ui";

export type NavigationLesson = {
  id: string;
  title: string;
  slug: string;
  position: number;
  durationSeconds: number | null;
  isFree: boolean;
  accessState: "free" | "included" | "locked";
  isCurrent: boolean;
};

export function LessonList({
  courseSlug,
  lessons,
  onNavigate,
}: {
  courseSlug: string;
  lessons: NavigationLesson[];
  onNavigate?: () => void;
}) {
  return (
    <nav className="pc-lesson-sidebar pc-lesson-queue" aria-label="Course lessons">
      <div className="pc-lesson-sidebar__header">
        <div>
          <Text className="pc-eyebrow">Course lessons</Text>
          <Title order={2} size="h4">
            All lessons
          </Title>
        </div>
        <Badge variant="light">{lessons.length}</Badge>
      </div>
      <div className="pc-lesson-list">
        {lessons.map((navigationLesson) => (
          <LessonRow
            key={navigationLesson.id}
            position={navigationLesson.position + 1}
            title={navigationLesson.title}
            meta={
              navigationLesson.durationSeconds
                ? `${Math.round(navigationLesson.durationSeconds / 60)} min`
                : "Duration pending"
            }
            status={navigationLesson.accessState}
            href={
              navigationLesson.accessState === "locked"
                ? undefined
                : "/courses/$courseSlug/lessons/$lessonSlug"
            }
            onClick={navigationLesson.accessState === "locked" ? undefined : onNavigate}
            params={
              navigationLesson.accessState === "locked"
                ? undefined
                : { courseSlug, lessonSlug: navigationLesson.slug }
            }
            className={navigationLesson.isCurrent ? "pc-lesson-row--current" : undefined}
          />
        ))}
      </div>
    </nav>
  );
}

export function LessonNavControls({
  courseSlug,
  previousLesson,
  nextLesson,
}: {
  courseSlug: string;
  previousLesson: NavigationLesson | null;
  nextLesson: NavigationLesson | null;
}) {
  return (
    <nav className="pc-lesson-nav" aria-label="Lesson navigation">
      {previousLesson ? (
        <Link
          to="/courses/$courseSlug/lessons/$lessonSlug"
          params={{ courseSlug, lessonSlug: previousLesson.slug }}
        >
          <Button leftSection={<ChevronLeft size={16} />} variant="light">
            Previous lesson
          </Button>
        </Link>
      ) : (
        <Button disabled leftSection={<ChevronLeft size={16} />} variant="light">
          Previous lesson
        </Button>
      )}
      {nextLesson ? (
        <Link
          to="/courses/$courseSlug/lessons/$lessonSlug"
          params={{ courseSlug, lessonSlug: nextLesson.slug }}
        >
          <Button rightSection={<ChevronRight size={16} />}>Next lesson</Button>
        </Link>
      ) : (
        <Button disabled rightSection={<ChevronRight size={16} />}>
          Next lesson
        </Button>
      )}
    </nav>
  );
}
