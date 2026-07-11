import { Badge, Button, Group, Paper, Stack, Table, Text, Title } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";

import { EmptyState } from "@/components/empty-state";
import { trpc } from "@/utils/trpc";

const coursesQueryOptions = trpc.admin.listCourses.queryOptions();

export const Route = createFileRoute("/_auth/admin/")({
  component: AdminCourses,
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(coursesQueryOptions);
  },
});

function AdminCourses() {
  const courses = useQuery(coursesQueryOptions);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8">
      <Stack gap="lg">
        <Group justify="space-between" align="end">
          <div>
            <Title order={1}>Admin</Title>
            <Text c="dimmed">Manage courses and publication state.</Text>
          </div>
          <Link to="/admin/courses/new">
            <Button>New course</Button>
          </Link>
        </Group>

        <Paper withBorder p="md" radius="sm">
          <Stack gap="md">
            <Title order={2} size="h4">
              Courses
            </Title>
            {courses.data?.length === 0 ? (
              <EmptyState
                title="No courses yet"
                description="Create the first course, then add lessons and grant users access."
                action={
                  <Link to="/admin/courses/new">
                    <Button>Create course</Button>
                  </Link>
                }
              />
            ) : (
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Title</Table.Th>
                    <Table.Th>Slug</Table.Th>
                    <Table.Th>Status</Table.Th>
                    <Table.Th />
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {courses.data?.map((course) => (
                    <Table.Tr key={course.id}>
                      <Table.Td>{course.title}</Table.Td>
                      <Table.Td>{course.slug}</Table.Td>
                      <Table.Td>
                        <Badge variant="light">{course.status}</Badge>
                      </Table.Td>
                      <Table.Td>
                        <Link to="/admin/courses/$courseId" params={{ courseId: course.id }}>
                          <Button variant="subtle" size="xs">
                            Edit
                          </Button>
                        </Link>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            )}
          </Stack>
        </Paper>
      </Stack>
    </main>
  );
}
