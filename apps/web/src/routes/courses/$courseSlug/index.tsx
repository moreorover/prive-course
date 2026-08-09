import { Badge, Button, Divider, Group, Stack, Text, Title } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { PlayCircle } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { LessonRow, PageHeader, PageShell, StatusBadge, Surface } from "@/components/ui";
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
    <PageShell>
      {course.data ? (
        <Stack gap="xl">
          <section className="pc-course-detail-hero">
            <div className="pc-course-detail-hero__copy">
              <PageHeader
                eyebrow="Private course"
                title={course.data.title}
                description={
                  course.data.description ||
                  "A Product Atelier course with protected lessons and private account access."
                }
                backTo={{ to: "/courses", label: "Back to courses" }}
                actions={
                  <Group>
                    {firstAccessibleLesson ? (
                      <Link
                        to="/courses/$courseSlug/lessons/$lessonSlug"
                        params={{ courseSlug, lessonSlug: firstAccessibleLesson.slug }}
                      >
                        <Button leftSection={<PlayCircle size={18} />}>Start learning</Button>
                      </Link>
                    ) : (
                      <Link to="/login">
                        <Button>Sign in for access</Button>
                      </Link>
                    )}
                    <Button variant="light" component="a" href="#lessons">
                      View lesson outline
                    </Button>
                  </Group>
                }
              />
            </div>
            <Surface variant="raised" className="pc-course-detail-hero__panel">
              <Badge variant="light">
                {course.data.hasActiveAccess ? "Access active" : "Preview mode"}
              </Badge>
              <Title order={2}>
                {course.data.hasActiveAccess
                  ? "Your private lessons are ready."
                  : "Preview the outline before access is granted."}
              </Title>
              <Text c="dimmed">
                Lessons stay inside the Product Atelier learning workspace. Free previews are open
                when available, and protected lessons unlock for granted accounts.
              </Text>
            </Surface>
          </section>

          <div className="pc-detail-layout">
            <section id="lessons" className="pc-section-stack">
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
                <div className="pc-lesson-list">
                  {course.data.lessons.map((lesson) => {
                    const canOpenLesson = lesson.isFree || course.data.hasActiveAccess;
                    const status = lesson.isFree
                      ? "free"
                      : course.data.hasActiveAccess
                        ? "included"
                        : "locked";

                    return (
                      <LessonRow
                        key={lesson.id}
                        position={lesson.position + 1}
                        title={lesson.title}
                        meta={
                          lesson.durationSeconds
                            ? `${Math.round(lesson.durationSeconds / 60)} min`
                            : "Duration pending"
                        }
                        status={status}
                        href={
                          canOpenLesson ? "/courses/$courseSlug/lessons/$lessonSlug" : undefined
                        }
                        params={canOpenLesson ? { courseSlug, lessonSlug: lesson.slug } : undefined}
                      />
                    );
                  })}
                </div>
              )}
            </section>

            <Surface variant="raised" className="pc-access-panel">
              <Text fw={800}>Private access</Text>
              <Divider />
              <div className="pc-access-stat">
                <Text c="dimmed">Lessons</Text>
                <Text fw={700}>{lessons.length}</Text>
              </div>
              <div className="pc-access-stat">
                <Text c="dimmed">Free previews</Text>
                <Text fw={700}>{freeLessonCount}</Text>
              </div>
              <div className="pc-access-stat">
                <Text c="dimmed">Status</Text>
                <StatusBadge status={course.data.hasActiveAccess ? "accessGranted" : "preview"} />
              </div>
              <Divider />
              <Text c="dimmed" size="sm">
                Buying Basic + Pro includes the Basic course. Course grants are managed by the
                Product Atelier team.
              </Text>
            </Surface>
          </div>
        </Stack>
      ) : (
        <Surface>
          <Text c="dimmed">{course.isLoading ? "Loading course..." : "Course unavailable."}</Text>
        </Surface>
      )}
    </PageShell>
  );
}
