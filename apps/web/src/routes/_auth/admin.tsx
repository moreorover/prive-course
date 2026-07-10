import { Badge, Button, Group, Paper, Stack, Table, Text, Title } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { Link, Navigate, createFileRoute } from "@tanstack/react-router";

import { trpc } from "@/utils/trpc";

export const Route = createFileRoute("/_auth/admin")({
  component: AdminRoute,
});

function AdminRoute() {
  const { session } = Route.useRouteContext();

  if (session.data?.user.role !== "admin") {
    return <Navigate to="/dashboard" />;
  }

  return <AdminCourses />;
}

function AdminCourses() {
  const courses = useQuery(trpc.admin.listCourses.queryOptions());

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
                {courses.data?.length === 0 ? (
                  <Table.Tr>
                    <Table.Td colSpan={4}>
                      <Text c="dimmed">No courses yet.</Text>
                    </Table.Td>
                  </Table.Tr>
                ) : null}
              </Table.Tbody>
            </Table>
          </Stack>
        </Paper>
      </Stack>
    </main>
  );
}
