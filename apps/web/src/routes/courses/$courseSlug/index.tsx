import { Badge, Button, Group, Paper, Stack, Text, Title } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";

import { EmptyState } from "@/components/empty-state";
import { trpc } from "@/utils/trpc";

function courseQueryOptions(courseSlug: string) {
  return trpc.courses.bySlug.queryOptions({ slug: courseSlug });
}

export const Route = createFileRoute("/courses/$courseSlug/")({
  component: CourseDetailRoute,
  loader: async ({ context, params }) => {
    await context.queryClient.ensureQueryData(courseQueryOptions(params.courseSlug));
  },
});

function CourseDetailRoute() {
  const { courseSlug } = Route.useParams();
  const course = useQuery(courseQueryOptions(courseSlug));

  return (
    <main className="pc-page">
      <Stack gap="xl">
        <Link to="/courses">
          <Button variant="subtle">Back to courses</Button>
        </Link>

        {course.data ? (
          <>
            <div>
              <Title order={1}>{course.data.title}</Title>
              <Text c="dimmed" maw={760}>
                {course.data.description || "No description yet."}
              </Text>
            </div>

            <section>
              <Stack gap="md">
                <Title order={2} size="h4">
                  Lessons
                </Title>
                {course.data.lessons.length === 0 ? (
                  <EmptyState
                    title="No lessons yet"
                    description="Lessons will appear here when they are available."
                  />
                ) : (
                  <Stack gap="sm">
                    {course.data.lessons.map((lesson) => {
                      const canOpenLesson = lesson.isFree || course.data.hasActiveAccess;
                      const accessLabel = lesson.isFree
                        ? "Free"
                        : course.data.hasActiveAccess
                          ? "Included"
                          : "Locked";
                      const lessonMeta = lesson.durationSeconds
                        ? `${Math.round(lesson.durationSeconds / 60)} min`
                        : "Duration pending";

                      const content = (
                        <Paper withBorder p="md" className="pc-panel">
                          <Group justify="space-between" align="start" gap="md">
                            <div>
                              <Text fw={700}>
                                {lesson.position + 1}. {lesson.title}
                              </Text>
                              <Text c="dimmed" size="sm">
                                {lessonMeta}
                              </Text>
                            </div>
                            <Badge
                              color={
                                lesson.isFree
                                  ? "teal"
                                  : course.data.hasActiveAccess
                                    ? "blue"
                                    : "gray"
                              }
                              variant="light"
                            >
                              {accessLabel}
                            </Badge>
                          </Group>
                        </Paper>
                      );

                      return canOpenLesson ? (
                        <Link
                          key={lesson.id}
                          to="/courses/$courseSlug/lessons/$lessonSlug"
                          params={{ courseSlug, lessonSlug: lesson.slug }}
                          style={{ color: "inherit", textDecoration: "none" }}
                        >
                          {content}
                        </Link>
                      ) : (
                        <div key={lesson.id}>{content}</div>
                      );
                    })}
                  </Stack>
                )}
              </Stack>
            </section>
          </>
        ) : (
          <Paper withBorder p="lg" className="pc-panel">
            <Text c="dimmed">{course.isLoading ? "Loading course..." : "Course unavailable."}</Text>
          </Paper>
        )}
      </Stack>
    </main>
  );
}
