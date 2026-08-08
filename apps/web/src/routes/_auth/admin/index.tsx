import { Badge, Button, Table } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";

import { EmptyState } from "@/components/empty-state";
import { DataTableShell, PageHeader, PageShell, StatusBadge } from "@/components/ui";
import { trpc } from "@/utils/trpc";

const coursesQueryOptions = trpc.admin.listCourses.queryOptions();

export const Route = createFileRoute("/_auth/admin/")({
  component: AdminCourses,
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(coursesQueryOptions);
  },
});

function courseStatusBadge(status: string) {
  if (status === "published" || status === "draft" || status === "archived") {
    return <StatusBadge status={status} />;
  }

  return <Badge variant="light">{status}</Badge>;
}

function AdminCourses() {
  const courses = useQuery(coursesQueryOptions);

  return (
    <PageShell size="wide">
      <PageHeader
        title="Admin"
        description="Manage courses, lessons, publication state, and private access."
        actions={
          <Link to="/admin/courses/new">
            <Button>New course</Button>
          </Link>
        }
      />

      <DataTableShell
        title="Courses"
        description="Create and maintain the course catalog."
        empty={
          courses.data?.length === 0 ? (
            <EmptyState
              title="No courses yet"
              description="Create the first course, then add lessons and grant users access."
              action={
                <Link to="/admin/courses/new">
                  <Button>Create course</Button>
                </Link>
              }
            />
          ) : undefined
        }
      >
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
                <Table.Td>{courseStatusBadge(course.status)}</Table.Td>
                <Table.Td className="pc-table-action">
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
      </DataTableShell>
    </PageShell>
  );
}
