import { Badge, Button, Group, Text, Title } from "@mantine/core";
import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { ArrowLeft, BookOpen, PlayCircle, Sparkles } from "lucide-react";

import { getMarketingCourse } from "@/features/course/marketing-courses";

export const Route = createFileRoute("/courses/$courseSlug/")({
  component: CourseDetailRoute,
  loader: ({ params }) => {
    const course = getMarketingCourse(params.courseSlug);

    if (!course) {
      throw notFound();
    }

    return { course };
  },
});

function CourseDetailRoute() {
  const { course } = Route.useLoaderData();

  return (
    <main className="pc-marketing-page">
      <section className="pc-course-detail pc-section-shell">
        <Link to="/courses">
          <Button
            className="pc-back-button"
            leftSection={<ArrowLeft size={16} />}
            radius="xl"
            variant="subtle"
          >
            Back to courses
          </Button>
        </Link>

        <div className="pc-course-detail-grid">
          <div className="pc-course-detail-copy">
            <Badge className="pc-eyebrow" variant="transparent">
              Private Course
            </Badge>
            <Title className="pc-display-title" order={1}>
              {course.title}
            </Title>
            <Text>{course.description}</Text>
            <Group gap="sm">
              <Link to="/login">
                <Button
                  className="pc-button-primary"
                  leftSection={<PlayCircle size={18} />}
                  radius="xl"
                >
                  Sign in for access
                </Button>
              </Link>
              <a className="pc-button-secondary" href="#lessons">
                View Outline
              </a>
            </Group>
          </div>

          <aside className="pc-access-panel">
            <div className="pc-panel-heading">
              <Sparkles aria-hidden size={19} strokeWidth={1.7} />
              <Text fw={800}>Course format</Text>
            </div>
            <div className="pc-access-row">
              <span>Level</span>
              <strong>{course.level}</strong>
            </div>
            <div className="pc-access-row">
              <span>Lessons</span>
              <strong>{course.lessonCount}</strong>
            </div>
            <div className="pc-access-row">
              <span>Duration</span>
              <strong>{course.duration}</strong>
            </div>
            <div className="pc-access-row">
              <span>Access</span>
              <strong>Manual grant</strong>
            </div>
          </aside>
        </div>

        <div
          className={`pc-course-detail-image pc-image-frame ${course.imageClass}`}
          role="img"
          aria-label={`${course.title} course visual placeholder`}
        />
      </section>

      <section id="lessons" className="pc-section-shell pc-section-block">
        <div className="pc-section-heading">
          <Title order={2}>Lesson outline</Title>
          <Text>Preview the learning path before access is granted by an admin.</Text>
        </div>
        <div className="pc-lesson-outline">
          {course.lessons.map((lesson, index) => (
            <article className="pc-lesson-row" key={lesson.title}>
              <div className="pc-lesson-index">
                <BookOpen aria-hidden size={18} strokeWidth={1.7} />
                <span>Lesson {index + 1}</span>
              </div>
              <div>
                <Title order={3}>{lesson.title}</Title>
                <Text>{lesson.description}</Text>
              </div>
              <Badge className="pc-status-available">{lesson.duration}</Badge>
            </article>
          ))}
        </div>
      </section>

      <section className="pc-final-cta pc-section-shell">
        <div>
          <Title order={2}>Ready to learn this method?</Title>
          <Text>Sign in when your course access has been granted by the Prive Course team.</Text>
        </div>
        <Link to="/login">
          <Button className="pc-button-light" radius="xl">
            Login
          </Button>
        </Link>
      </section>
    </main>
  );
}
