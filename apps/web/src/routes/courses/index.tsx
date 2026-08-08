import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { EmptyState } from "@/components/empty-state";
import { CourseCard, PageHeader, PageShell, StatusBadge } from "@/components/ui";
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
        title="Choose your next private course"
        description="Browse published courses, preview what is open, and continue when your course access is active."
      />

      {courses.data?.length === 0 ? (
        <EmptyState
          title="No courses yet"
          description="Courses will appear here when they are available."
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
    </PageShell>
  );
}
