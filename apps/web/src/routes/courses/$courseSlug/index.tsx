import { Badge, Button, Divider, Group, Text, Title } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, BookOpen, PlayCircle } from "lucide-react";

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
  const courseOutcomes = [
    {
      title: "Build a cleaner service method",
      description:
        "Move through the course with a structured lesson order instead of scattered tips.",
    },
    {
      title: "Know what opens now",
      description:
        "Free previews, included lessons, and locked lessons are visible before you start.",
    },
    {
      title: "Continue inside protected lessons",
      description: "Private playback and account access keep the learning experience contained.",
    },
  ];
  const primaryAction = firstAccessibleLesson ? (
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
  );

  return (
    <PageShell>
      {course.data ? (
        <div className="pc-course-product">
          <section className="pc-course-product-hero">
            <div className="pc-course-product-hero__copy">
              <Link to="/courses" className="pc-back-link">
                <ArrowLeft size={16} aria-hidden="true" />
                <span>Back to courses</span>
              </Link>
              <Text className="pc-eyebrow">Private course</Text>
              <Title order={1}>{course.data.title}</Title>
              <Text c="dimmed" size="lg" maw={720}>
                {course.data.description ||
                  "A Product Atelier course with protected lessons and private account access."}
              </Text>
              <Group className="pc-course-product-hero__actions">
                {primaryAction}
                <Button variant="light" component="a" href="#syllabus">
                  View syllabus
                </Button>
              </Group>
            </div>

            <Surface variant="raised" className="pc-course-product-hero__panel">
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
              <div className="pc-course-product-hero__stats">
                <div>
                  <Text fw={850}>{lessons.length}</Text>
                  <Text c="dimmed" size="sm">
                    Lessons
                  </Text>
                </div>
                <div>
                  <Text fw={850}>{freeLessonCount}</Text>
                  <Text c="dimmed" size="sm">
                    Free previews
                  </Text>
                </div>
              </div>
            </Surface>
          </section>

          <section className="pc-course-outcomes" aria-label="Course outcomes">
            {courseOutcomes.map((outcome) => (
              <article className="pc-course-outcome" key={outcome.title}>
                <BookOpen size={18} aria-hidden="true" />
                <Title order={3}>{outcome.title}</Title>
                <Text c="dimmed">{outcome.description}</Text>
              </article>
            ))}
          </section>

          <div className="pc-detail-layout">
            <section id="syllabus" className="pc-course-syllabus">
              <div className="pc-course-syllabus__header">
                <div>
                  <Text className="pc-eyebrow">Syllabus</Text>
                  <Title order={2}>Course curriculum</Title>
                </div>
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

            <Surface variant="raised" className="pc-course-access-card pc-access-panel">
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
              {primaryAction}
              <Divider />
              <Text c="dimmed" size="sm">
                Buying Basic + Pro includes the Basic course. Course grants are managed by the
                Product Atelier team.
              </Text>
            </Surface>
          </div>
        </div>
      ) : (
        <Surface>
          <Text c="dimmed">{course.isLoading ? "Loading course..." : "Course unavailable."}</Text>
        </Surface>
      )}
    </PageShell>
  );
}
