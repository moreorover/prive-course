import { Badge, Button, Group, Text, Title } from "@mantine/core";
import { Link, createFileRoute } from "@tanstack/react-router";
import { GraduationCap } from "lucide-react";

import { marketingCourses } from "@/features/course/marketing-courses";

export const Route = createFileRoute("/courses/")({
  component: CoursesRoute,
});

function CoursesRoute() {
  return (
    <div className="pc-marketing-page">
      <section className="pc-catalog-hero pc-section-shell">
        <div className="pc-catalog-intro">
          <Badge className="pc-eyebrow" variant="transparent">
            Course Catalog
          </Badge>
          <Title className="pc-display-title" order={1}>
            Choose the next technique to strengthen your salon work
          </Title>
          <Text>
            Each Prive Course is built for focused video learning, practical review, and confident
            client application.
          </Text>
        </div>
      </section>

      <section className="pc-section-shell pc-section-block">
        <div className="pc-course-grid">
          {marketingCourses.map((course) => (
            <article
              className={
                !course.isAvailable ? "pc-course-card pc-course-card-soon" : "pc-course-card"
              }
              key={course.slug}
            >
              <div
                aria-label={`${course.title} thumbnail placeholder`}
                className={`pc-course-thumb ${course.imageClass}`}
                role="img"
              >
                {!course.isAvailable ? <span>Coming Soon</span> : null}
              </div>
              <div className="pc-course-body">
                <div className="pc-course-topline">
                  <Badge className={!course.isAvailable ? "pc-status-soon" : "pc-status-available"}>
                    {course.isAvailable ? "Available" : "Coming Soon"}
                  </Badge>
                  <span>{course.level}</span>
                </div>
                <Title order={2}>{course.title}</Title>
                <Text>{course.description}</Text>
                <div className="pc-meta-list">
                  <div>
                    <span>Lessons</span>
                    <strong>{course.lessonCount}</strong>
                  </div>
                  <div>
                    <span>Duration</span>
                    <strong>{course.duration}</strong>
                  </div>
                  <div>
                    <span>Price</span>
                    <strong>{course.price}</strong>
                  </div>
                </div>
                {!course.isAvailable ? (
                  <Button className="pc-button-disabled" disabled fullWidth radius="xl">
                    Notify Me
                  </Button>
                ) : (
                  <Link to="/courses/$courseSlug" params={{ courseSlug: course.slug }}>
                    <Button className="pc-button-primary" fullWidth radius="xl">
                      View Course
                    </Button>
                  </Link>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="pc-catalog-band pc-section-shell" aria-labelledby="catalog-band-heading">
        <div>
          <Title order={2} id="catalog-band-heading">
            Not sure where to start?
          </Title>
          <Text>
            Begin with fundamentals, then move into method-specific training as your client book
            grows.
          </Text>
        </div>
        <Group gap="sm">
          <GraduationCap aria-hidden size={22} strokeWidth={1.7} />
          <Link to="/courses/$courseSlug" params={{ courseSlug: marketingCourses[0].slug }}>
            <Button className="pc-button-light" radius="xl">
              Start Here
            </Button>
          </Link>
        </Group>
      </section>
    </div>
  );
}
