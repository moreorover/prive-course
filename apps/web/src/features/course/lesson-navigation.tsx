import { Badge, Button, Group, Paper, Stack, Text, Title } from "@mantine/core";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";

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

function getAccessBadge(lesson: NavigationLesson) {
  if (lesson.accessState === "free") {
    return (
      <Badge color="teal" variant="light">
        Free
      </Badge>
    );
  }

  if (lesson.accessState === "included") {
    return (
      <Badge color="blue" variant="light">
        Included
      </Badge>
    );
  }

  return (
    <Badge color="gray" variant="light">
      Locked
    </Badge>
  );
}

export function LessonList({
  courseSlug,
  lessons,
}: {
  courseSlug: string;
  lessons: NavigationLesson[];
}) {
  return (
    <section>
      <Stack gap="md">
        <Title order={2} size="h4">
          Lessons
        </Title>
        <Stack gap="xs">
          {lessons.map((navigationLesson) => {
            const lessonTitle = (
              <Group justify="space-between" align="start" gap="sm" wrap="nowrap">
                <div>
                  <Text fw={navigationLesson.isCurrent ? 700 : 500}>
                    {navigationLesson.position + 1}. {navigationLesson.title}
                  </Text>
                  <Text c="dimmed" size="sm">
                    {navigationLesson.durationSeconds
                      ? `${Math.round(navigationLesson.durationSeconds / 60)} min`
                      : "Pending"}
                  </Text>
                </div>
                {getAccessBadge(navigationLesson)}
              </Group>
            );

            if (navigationLesson.accessState === "locked") {
              return (
                <Paper key={navigationLesson.id} withBorder p="sm" className="pc-panel">
                  {lessonTitle}
                </Paper>
              );
            }

            return (
              <Link
                key={navigationLesson.id}
                to="/courses/$courseSlug/lessons/$lessonSlug"
                params={{ courseSlug, lessonSlug: navigationLesson.slug }}
                style={{ color: "inherit", textDecoration: "none" }}
              >
                <Paper
                  withBorder
                  p="sm"
                  className="pc-panel"
                  bg={navigationLesson.isCurrent ? "var(--mantine-color-blue-light)" : undefined}
                >
                  {lessonTitle}
                </Paper>
              </Link>
            );
          })}
        </Stack>
      </Stack>
    </section>
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
    <Group justify="space-between">
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
    </Group>
  );
}
