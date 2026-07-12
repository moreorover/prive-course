import { Button, Paper, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";

import { EmptyState } from "@/components/empty-state";
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
    <main className="mx-auto w-full max-w-6xl px-4 py-8">
      <Stack gap="lg">
        <div>
          <Title order={1}>Courses</Title>
          <Text c="dimmed">Explore available courses.</Text>
        </div>

        {courses.data?.length === 0 ? (
          <Paper withBorder radius="sm">
            <EmptyState
              title="No courses yet"
              description="Courses will appear here when they are available."
            />
          </Paper>
        ) : null}

        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
          {courses.data?.map((course) => (
            <Paper key={course.id} withBorder p="md" radius="sm">
              <Stack gap="sm">
                <div>
                  <Title order={2} size="h4">
                    {course.title}
                  </Title>
                </div>
                <Text c="dimmed" lineClamp={3}>
                  {course.description || "No description yet."}
                </Text>
                <Link to="/courses/$courseSlug" params={{ courseSlug: course.slug }}>
                  <Button>View course</Button>
                </Link>
              </Stack>
            </Paper>
          ))}
        </SimpleGrid>
      </Stack>
    </main>
  );
}
