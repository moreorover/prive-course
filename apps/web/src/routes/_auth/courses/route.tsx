import { Badge, Button, Group, Paper, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";

import { trpc } from "@/utils/trpc";

export const Route = createFileRoute("/_auth/courses")({
  component: CoursesRoute,
});

function CoursesRoute() {
  const courses = useQuery(trpc.courses.listGranted.queryOptions());

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8">
      <Stack gap="lg">
        <div>
          <Title order={1}>Courses</Title>
          <Text c="dimmed">Courses you have access to.</Text>
        </div>

        {courses.data?.length === 0 ? (
          <Paper withBorder p="lg" radius="sm">
            <Text c="dimmed">No courses have been granted to this account yet.</Text>
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
