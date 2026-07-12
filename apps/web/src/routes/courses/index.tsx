import { Badge, Button, Group, Paper, SimpleGrid, Stack, Text, Title } from "@mantine/core";
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
    <main className="pc-page">
      <Stack gap="xl">
        <div>
          <Title order={1}>Courses</Title>
          <Text c="dimmed" maw={680}>
            Browse available courses and open free previews before signing in.
          </Text>
        </div>

        {courses.data?.length === 0 ? (
          <EmptyState
            title="No courses yet"
            description="Courses will appear here when they are available."
          />
        ) : null}

        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
          {courses.data?.map((course) => (
            <Paper key={course.id} withBorder p="lg" className="pc-panel">
              <Stack gap="md">
                <Group justify="space-between" align="start" gap="md" wrap="nowrap">
                  <Title order={2} size="h4">
                    {course.title}
                  </Title>
                  {course.hasActiveAccess ? (
                    <Badge color="teal" variant="light">
                      Access granted
                    </Badge>
                  ) : null}
                </Group>
                <Text c="dimmed" lineClamp={3}>
                  {course.description || "No description yet."}
                </Text>
                <Link to="/courses/$courseSlug" params={{ courseSlug: course.slug }}>
                  <Button variant={course.hasActiveAccess ? "filled" : "light"}>View course</Button>
                </Link>
              </Stack>
            </Paper>
          ))}
        </SimpleGrid>
      </Stack>
    </main>
  );
}
