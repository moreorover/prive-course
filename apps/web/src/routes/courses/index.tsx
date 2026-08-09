import { Badge, Button, Text, Title } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Check } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { CourseCard, PageHeader, PageShell, StatusBadge } from "@/components/ui";
import { COURSE_OFFERS } from "@/features/marketing/course-offers";
import { trpc } from "@/utils/trpc";

const publishedCoursesQueryOptions = trpc.courses.listPublished.queryOptions();

export const Route = createFileRoute("/courses/")({
  component: CoursesRoute,
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(publishedCoursesQueryOptions);
  },
});

function CoursesRoute() {
  const courses = useQuery(publishedCoursesQueryOptions);

  return (
    <PageShell>
      <PageHeader
        eyebrow="Private course library"
        title="Choose the course path that matches your next move."
        description="Browse the live Product Atelier library. Basic builds the foundation, Basic + Pro expands the extension pathway, and Social Media Marketing Strategy focuses on demand."
      />

      <section className="pc-course-path-strip" aria-label="Course path overview">
        {COURSE_OFFERS.map((offer) => (
          <article
            className={`pc-course-path-strip__item pc-course-path-strip__item--${offer.emphasis}`}
            key={offer.id}
          >
            <Badge variant={offer.emphasis === "primary" ? "filled" : "light"}>
              {offer.eyebrow}
            </Badge>
            <Title order={2}>{offer.shortTitle}</Title>
            <Text c="dimmed">{offer.accessNote}</Text>
            <ul className="pc-check-list">
              {offer.includes.slice(0, 2).map((item) => (
                <li key={item}>
                  <Check size={16} aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <section className="pc-section-stack">
        <div className="pc-catalog-heading">
          <div>
            <Text className="pc-eyebrow">Published courses</Text>
            <Title order={2}>Open the live course library.</Title>
          </div>
          <Link to="/" hash="updates">
            <Button variant="light" rightSection={<ArrowRight size={16} />}>
              Get release updates
            </Button>
          </Link>
        </div>

        {courses.data?.length === 0 ? (
          <EmptyState
            title="Course releases are being prepared"
            description="Published courses will appear here as enrollment windows open."
          />
        ) : (
          <div className="pc-course-grid">
            {courses.data?.map((course) => (
              <CourseCard
                key={course.id}
                title={course.title}
                description={course.description}
                href="/courses/$courseSlug"
                params={{ courseSlug: course.slug }}
                meta={<StatusBadge status="preview" />}
              />
            ))}
          </div>
        )}
      </section>
    </PageShell>
  );
}
