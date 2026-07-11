import { Badge, Button, Group, Paper, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";

import { EmptyState } from "@/components/empty-state";
import { trpc } from "@/utils/trpc";

const grantedCoursesQueryOptions = trpc.courses.listGranted.queryOptions();

export const Route = createFileRoute("/_auth/courses/")({
  component: CoursesRoute,
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(grantedCoursesQueryOptions);
  },
});

function CoursesRoute() {
  const courses = useQuery(grantedCoursesQueryOptions);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8">
      <Stack gap="lg">
        <div>
          <Title order={1}>Courses</Title>
          <Text c="dimmed">Courses you have access to.</Text>
        </div>

        {courses.data?.length === 0 ? (
          <Paper withBorder radius="sm">
            <EmptyState
              title="No courses yet"
              description="This account does not have access to any courses. Ask an admin to grant access to a course."
            />
          </Paper>
        ) : null}

        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
          {courses.data?.map((course) => (
            <Paper key={course.id} withBorder p="md" radius="sm">
              <Stack gap="sm">
                <Group justify="space-between" align="start">
                  <Title order={2} size="h4">
                    {course.title}
                  </Title>
                  <Badge variant="light">{course.status}</Badge>
                </Group>
                <Text c="dimmed" lineClamp={3}>
                  {course.description || "No description yet."}
                </Text>
                <Link to="/courses/$courseSlug" params={{ courseSlug: course.slug }}>
                  <Button>Open course</Button>
                </Link>
              </Stack>
            </Paper>
          ))}
        </SimpleGrid>
      </Stack>
    </main>
  );
}
