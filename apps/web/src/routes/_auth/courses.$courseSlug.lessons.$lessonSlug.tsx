import { Badge, Button, Group, Paper, Stack, Text, Title } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";

import { trpc } from "@/utils/trpc";

export const Route = createFileRoute("/_auth/courses/$courseSlug/lessons/$lessonSlug")({
  component: LessonRoute,
});

function LessonRoute() {
  const { courseSlug, lessonSlug } = Route.useParams();
  const lesson = useQuery(
    trpc.courses.lessonBySlug.queryOptions({
      courseSlug,
      lessonSlug,
    }),
  );

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

            <Paper withBorder radius="sm" p="md">
              <div className="grid aspect-video place-items-center border border-dashed">
                <Stack align="center" gap="xs">
                  <Text fw={600}>
                    {lesson.data.lesson.videoUid ? "Video playback pending" : "No video uploaded"}
                  </Text>
                  <Text c="dimmed" ta="center" maw={480}>
                    The lesson route is access-controlled. Cloudflare Stream playback will be wired
                    after the signed token endpoint is implemented.
                  </Text>
                </Stack>
              </div>
            </Paper>

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
