import { Badge, Button, Divider, Group, Paper, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Lock, PlayCircle, Sparkles } from "lucide-react";

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
  const lessons = course.data?.lessons ?? [];
  const firstAccessibleLesson = lessons.find(
    (lesson) => lesson.isFree || course.data?.hasActiveAccess,
  );
  const freeLessonCount = lessons.filter((lesson) => lesson.isFree).length;

  return (
    <main className="pc-page">
      <Stack gap={48}>
        <Link to="/courses">
          <Button variant="subtle">Back to courses</Button>
        </Link>

        {course.data ? (
          <>
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
              <Stack gap="lg">
                <Badge color="gold" variant="light" w="fit-content">
                  Private course
                </Badge>
                <Title order={1} size="3rem" lh={1.03}>
                  {course.data.title}
                </Title>
                <Text c="dimmed" size="lg" maw={760}>
                  {course.data.description || "No description yet."}
                </Text>
                <Group>
                  {firstAccessibleLesson ? (
                    <Link
                      to="/courses/$courseSlug/lessons/$lessonSlug"
                      params={{ courseSlug, lessonSlug: firstAccessibleLesson.slug }}
                    >
                      <Button color="gold" leftSection={<PlayCircle size={18} />}>
                        Start learning
                      </Button>
                    </Link>
                  ) : (
                    <Link to="/login">
                      <Button color="gold">Sign in for access</Button>
                    </Link>
                  )}
                  <Button variant="light" color="gold" component="a" href="#lessons">
                    View lesson outline
                  </Button>
                </Group>
              </Stack>

              <Paper
                withBorder
                p="lg"
                className="pc-panel"
                style={{ borderTop: "3px solid var(--pc-accent)" }}
              >
                <Stack gap="md">
                  <Group gap="sm">
                    <ThemeIcon color="gold" variant="light">
                      <Sparkles size={18} />
                    </ThemeIcon>
                    <Text fw={800}>Course access</Text>
                  </Group>
                  <Divider />
                  <Group justify="space-between">
                    <Text c="dimmed">Lessons</Text>
                    <Text fw={700}>{lessons.length}</Text>
                  </Group>
                  <Group justify="space-between">
                    <Text c="dimmed">Free previews</Text>
                    <Text fw={700}>{freeLessonCount}</Text>
                  </Group>
                  <Group justify="space-between" align="start">
                    <Text c="dimmed">Status</Text>
                    <Badge color={course.data.hasActiveAccess ? "gold" : "gray"} variant="light">
                      {course.data.hasActiveAccess ? "Access granted" : "Preview available"}
                    </Badge>
                  </Group>
                </Stack>
              </Paper>
            </div>

            <section id="lessons">
              <Stack gap="md">
                <div>
                  <Title order={2}>Lesson outline</Title>
                  <Text c="dimmed">
                    Preview free lessons and see what is included with full course access.
                  </Text>
                </div>
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
                      const badgeColor = lesson.isFree
                        ? "gold"
                        : course.data.hasActiveAccess
                          ? "teal"
                          : "gray";

                      const content = (
                        <Paper
                          withBorder
                          p="lg"
                          className="pc-panel"
                          style={{
                            borderLeft: canOpenLesson
                              ? "3px solid var(--pc-accent)"
                              : "3px solid var(--pc-border)",
                          }}
                        >
                          <Group justify="space-between" align="start" gap="md">
                            <Group gap="md" align="start" wrap="nowrap">
                              <ThemeIcon color={canOpenLesson ? "gold" : "gray"} variant="light">
                                {canOpenLesson ? <PlayCircle size={18} /> : <Lock size={18} />}
                              </ThemeIcon>
                              <div>
                                <Text fw={800} size="xs" c="dimmed" tt="uppercase">
                                  Lesson {lesson.position + 1}
                                </Text>
                                <Text fw={700}>{lesson.title}</Text>
                                <Text c="dimmed" size="sm">
                                  {lessonMeta}
                                </Text>
                              </div>
                            </Group>
                            <Badge color={badgeColor} variant="light">
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
