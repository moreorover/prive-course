import { Badge, Button, Text, Title } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { PageShell } from "@/components/ui";
import { getCourseOffer } from "@/features/marketing/course-offers";
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
    <PageShell size="wide">
      <section className="pc-catalog">
        <div className="pc-catalog__intro">
          <Text className="pc-eyebrow">Courses</Text>
          <Title order={1}>
            Deep-dive into practical beauty skills with focused video courses.
          </Title>
          <Text c="dimmed" size="lg">
            Choose the course path that fits the next step in your services or content strategy.
            Basic + Pro includes the Basic extension foundation.
          </Text>
        </div>

        {courses.data?.length === 0 ? (
          <EmptyState
            title="Course releases are being prepared"
            description="Published courses will appear here as enrollment windows open."
          />
        ) : (
          <div className="pc-catalog-list">
            {courses.data?.map((course, index) => {
              const offer = getCourseOffer(course);

              return (
                <article
                  className={`pc-catalog-course pc-catalog-course--${offer.emphasis}`}
                  key={course.id}
                >
                  <div className="pc-catalog-course__media" aria-hidden="true">
                    <span>{String(index + 1).padStart(2, "0")}</span>
                  </div>
                  <div className="pc-catalog-course__body">
                    <div className="pc-catalog-course__meta">
                      <Badge variant={offer.emphasis === "primary" ? "filled" : "light"}>
                        {offer.emphasis === "primary" ? "Featured path" : "Available"}
                      </Badge>
                      <span>#{offer.id.replaceAll("-", " #")}</span>
                    </div>
                    <Title order={2}>{course.title}</Title>
                    <Text c="dimmed">{course.description || offer.summary}</Text>
                    <Text className="pc-catalog-course__access">{offer.accessNote}</Text>
                    <div className="pc-catalog-course__actions">
                      <Link to="/courses/$courseSlug" params={{ courseSlug: course.slug }}>
                        <Button rightSection={<ArrowRight size={16} />}>Start Learning</Button>
                      </Link>
                      <Link to="/courses/$courseSlug" params={{ courseSlug: course.slug }}>
                        <Button variant="subtle">Course Details</Button>
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </PageShell>
  );
}
