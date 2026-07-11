import { Badge, Button, Group, Paper, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";

import { EmptyState } from "@/components/empty-state";
import { authClient } from "@/lib/auth-client";
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
  const { data: session, isPending: isSessionPending } = authClient.useSession();

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8">
      <Stack gap="lg">
        <div>
          <Title order={1}>Courses</Title>
          <Text c="dimmed">Explore all published courses.</Text>
        </div>

        {courses.data?.length === 0 ? (
          <Paper withBorder radius="sm">
            <EmptyState
              title="No published courses"
              description="Courses will appear here after an admin publishes them."
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
                  <Badge color={course.hasActiveAccess ? "teal" : "gray"} variant="light">
                    {course.hasActiveAccess ? "Access granted" : "Account access required"}
                  </Badge>
                </Group>
                <Text c="dimmed" lineClamp={3}>
                  {course.description || "No description yet."}
                </Text>
                {course.hasActiveAccess ? (
                  <Link to="/courses/$courseSlug" params={{ courseSlug: course.slug }}>
                    <Button>Open course</Button>
                  </Link>
                ) : session ? (
                  <Button disabled variant="light">
                    Access required
                  </Button>
                ) : (
                  <Link to="/login">
                    <Button loading={isSessionPending} variant="light">
                      Sign in for access
                    </Button>
                  </Link>
                )}
              </Stack>
            </Paper>
          ))}
        </SimpleGrid>
      </Stack>
    </main>
  );
}
