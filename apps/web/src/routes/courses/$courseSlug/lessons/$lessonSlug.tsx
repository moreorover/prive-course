import { Badge, Button, Group, Paper, Stack, Text, Title } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";

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
  loader: async ({ context, params }) => {
    await context.queryClient.ensureQueryData(
      lessonQueryOptions(params.courseSlug, params.lessonSlug),
    );
  },
});

function LessonRoute() {
  const { courseSlug, lessonSlug } = Route.useParams();
  const lesson = useQuery(lessonQueryOptions(courseSlug, lessonSlug));

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8">
      <Stack gap="lg">
        <Link to="/courses/$courseSlug" params={{ courseSlug }}>
          <Button variant="subtle">Back to course</Button>
        </Link>

        {lesson.data ? (
          <>
            <div>
              <Group gap="sm">
                <Title order={1}>{lesson.data.lesson.title}</Title>
                <Badge variant="light">{lesson.data.lesson.status}</Badge>
              </Group>
              <Text c="dimmed">{lesson.data.course.title}</Text>
            </div>

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

            {lesson.data.lesson.description ? (
              <Paper withBorder radius="sm" p="md">
                <Text>{lesson.data.lesson.description}</Text>
              </Paper>
            ) : null}
          </>
        ) : (
          <Paper withBorder p="lg" radius="sm">
            <Text c="dimmed">{lesson.isLoading ? "Loading lesson..." : "Lesson unavailable."}</Text>
          </Paper>
        )}
      </Stack>
    </main>
  );
}
