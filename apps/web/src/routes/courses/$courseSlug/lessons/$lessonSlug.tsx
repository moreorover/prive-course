import { Badge, Button, Group, Paper, Stack, Text, Title } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute, type ErrorComponentProps } from "@tanstack/react-router";

import { LessonList, LessonNavControls } from "@/features/course/lesson-navigation";
import { LessonPlayer } from "@/features/course/lesson-player";
import { queryClient, trpc } from "@/utils/trpc";

function lessonQueryOptions(courseSlug: string, lessonSlug: string) {
  return trpc.courses.lessonBySlug.queryOptions({
    courseSlug,
    lessonSlug,
  });
}

export const Route = createFileRoute("/courses/$courseSlug/lessons/$lessonSlug")({
  component: LessonRoute,
  errorComponent: LessonError,
  loader: async ({ context, params }) => {
    await context.queryClient.ensureQueryData(
      lessonQueryOptions(params.courseSlug, params.lessonSlug),
    );
  },
});

function isCourseAccessError(error: unknown) {
  return error instanceof Error && error.message === "Course access required";
}

function LessonError({ error }: ErrorComponentProps) {
  const { courseSlug } = Route.useParams();

  if (!isCourseAccessError(error)) {
    return (
      <main className="pc-page">
        <Stack gap="lg">
          <Link to="/courses/$courseSlug" params={{ courseSlug }}>
            <Button variant="subtle">Back to course</Button>
          </Link>
          <Paper withBorder p="lg" className="pc-panel">
            <Stack gap="xs">
              <Title order={1} size="h3">
                Lesson unavailable
              </Title>
              <Text c="dimmed">
                {error instanceof Error ? error.message : "This lesson could not be loaded."}
              </Text>
            </Stack>
          </Paper>
        </Stack>
      </main>
    );
  }

  return (
    <main className="pc-page">
      <Stack gap="lg">
        <Link to="/courses/$courseSlug" params={{ courseSlug }}>
          <Button variant="subtle">Back to course</Button>
        </Link>
        <Paper withBorder p="lg" className="pc-panel">
          <Stack gap="md">
            <Group gap="sm">
              <Badge color="gray" variant="light">
                Locked
              </Badge>
              <Text c="dimmed">Course access required</Text>
            </Group>
            <div>
              <Title order={1} size="h3">
                This lesson is included with course access
              </Title>
              <Text c="dimmed" mt="xs">
                Free preview lessons can be watched without signing in. This lesson requires an
                account with active access to the course.
              </Text>
            </div>
            <Group>
              <Link to="/login">
                <Button>Sign in</Button>
              </Link>
              <Link to="/courses/$courseSlug" params={{ courseSlug }}>
                <Button variant="light">View course lessons</Button>
              </Link>
            </Group>
          </Stack>
        </Paper>
      </Stack>
    </main>
  );
}

function LessonRoute() {
  const { courseSlug, lessonSlug } = Route.useParams();
  const lesson = useQuery(lessonQueryOptions(courseSlug, lessonSlug));

  return (
    <main className="pc-page">
      <Stack gap="xl">
        <Link to="/courses/$courseSlug" params={{ courseSlug }}>
          <Button variant="subtle">Back to course</Button>
        </Link>

        {lesson.data ? (
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(240px,300px)] lg:items-start">
            <Stack gap="xl">
              <div>
                <Group gap="sm">
                  <Title order={1}>{lesson.data.lesson.title}</Title>
                  {lesson.data.lesson.isFree ? (
                    <Badge color="teal" variant="light">
                      Free preview
                    </Badge>
                  ) : null}
                </Group>
                <Text c="dimmed">{lesson.data.course.title}</Text>
              </div>

              <LessonNavControls
                courseSlug={courseSlug}
                previousLesson={lesson.data.navigation.previousLesson}
                nextLesson={lesson.data.navigation.nextLesson}
              />

              <LessonPlayer
                key={lesson.data.lesson.id}
                lessonId={lesson.data.lesson.id}
                videoUid={lesson.data.lesson.videoUid}
                durationSeconds={lesson.data.lesson.durationSeconds}
                initialProgressSeconds={lesson.data.progress?.progressSeconds ?? 0}
                isCompleted={Boolean(lesson.data.progress?.completedAt)}
                onProgressSaved={() =>
                  queryClient.invalidateQueries({
                    queryKey: trpc.courses.lessonBySlug.queryKey({ courseSlug, lessonSlug }),
                  })
                }
              />

              <LessonNavControls
                courseSlug={courseSlug}
                previousLesson={lesson.data.navigation.previousLesson}
                nextLesson={lesson.data.navigation.nextLesson}
              />

              {lesson.data.lesson.description ? (
                <Paper withBorder p="md" className="pc-panel">
                  <Text>{lesson.data.lesson.description}</Text>
                </Paper>
              ) : null}
            </Stack>

            <LessonList courseSlug={courseSlug} lessons={lesson.data.navigation.lessons} />
          </div>
        ) : (
          <Paper withBorder p="lg" className="pc-panel">
            <Text c="dimmed">{lesson.isLoading ? "Loading lesson..." : "Lesson unavailable."}</Text>
          </Paper>
        )}
      </Stack>
    </main>
  );
}
