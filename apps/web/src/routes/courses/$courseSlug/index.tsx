import { Badge, Button, Text, Title } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, PlayCircle } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { LessonRow, PageShell, Surface } from "@/components/ui";
import { getCourseOffer } from "@/features/marketing/course-offers";
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
  const offer = course.data ? getCourseOffer(course.data) : null;
  const firstAccessibleLesson = lessons.find(
    (lesson) => lesson.isFree || course.data?.hasActiveAccess,
  );
  const primaryAction = firstAccessibleLesson ? (
    <Link
      to="/courses/$courseSlug/lessons/$lessonSlug"
      params={{ courseSlug, lessonSlug: firstAccessibleLesson.slug }}
    >
      <Button leftSection={<PlayCircle size={18} />}>Start Learning</Button>
    </Link>
  ) : (
    <Link to="/login">
      <Button>Sign in for access</Button>
    </Link>
  );

  return (
    <PageShell size="wide">
      {course.data ? (
        <div className="pc-course-landing">
          <section className="pc-course-landing__hero">
            <div className="pc-course-landing__media" aria-hidden="true">
              <span>{course.data.title}</span>
            </div>

            <div className="pc-course-landing__intro">
              <Link to="/courses" className="pc-back-link">
                <ArrowLeft size={16} aria-hidden="true" />
                <span>Back to courses</span>
              </Link>
              <div className="pc-course-landing__meta">
                <Badge variant={course.data.hasActiveAccess ? "filled" : "light"}>
                  {course.data.hasActiveAccess ? "Access active" : "Available"}
                </Badge>
                <span>#{offer?.id.replaceAll("-", " #")}</span>
              </div>
              <Title order={1}>{course.data.title}</Title>
              <Text c="dimmed" size="lg" maw={720}>
                {course.data.description ||
                  offer?.summary ||
                  "A Product Atelier course with protected lessons and private account access."}
              </Text>
              <div className="pc-course-landing__actions">
                {primaryAction}
                <Button variant="subtle" component="a" href="#contents">
                  Course Details
                </Button>
              </div>
            </div>
          </section>

          <section className="pc-course-article">
            <article>
              <Text className="pc-eyebrow">What this course teaches</Text>
              <Title order={2}>A structured path through the work, not scattered tips.</Title>
              <Text c="dimmed">
                {offer?.includes.join(", ") ||
                  "Move through the lessons in order, watch inside the protected player, and use the notes as a reference while you build confidence with the service or strategy."}
              </Text>
            </article>
            <article>
              <Text className="pc-eyebrow">Who it is for</Text>
              <Title order={2}>Beauty professionals who want a focused private course space.</Title>
              <Text c="dimmed">
                {offer?.audience ||
                  "This is designed for learners who want clear lesson progression and practical course access, without a public marketplace or generic SaaS dashboard around it."}
              </Text>
            </article>
          </section>

          <section id="contents" className="pc-course-contents">
            <div className="pc-course-contents__header">
              <div>
                <Text className="pc-eyebrow">Course contents</Text>
                <Title order={2}>Start with the first available lesson.</Title>
              </div>
              <Text c="dimmed">
                Free previews are open when available. Protected lessons unlock for accounts with
                granted course access.
              </Text>
            </div>
            {course.data.lessons.length === 0 ? (
              <EmptyState
                title="No lessons yet"
                description="Lessons will appear here when they are available."
              />
            ) : (
              <div className="pc-lesson-list pc-course-contents__list">
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
                      href={canOpenLesson ? "/courses/$courseSlug/lessons/$lessonSlug" : undefined}
                      params={canOpenLesson ? { courseSlug, lessonSlug: lesson.slug } : undefined}
                    />
                  );
                })}
              </div>
            )}
          </section>
        </div>
      ) : (
        <Surface>
          <Text c="dimmed">{course.isLoading ? "Loading course..." : "Course unavailable."}</Text>
        </Surface>
      )}
    </PageShell>
  );
}
