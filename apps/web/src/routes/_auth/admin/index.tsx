import { Badge, Button, SimpleGrid, Table, Text, Title } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";

import { EmptyState } from "@/components/empty-state";
import { DataTableShell, PageHeader, PageShell, StatusBadge, Surface } from "@/components/ui";
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
  const publishedCount =
    courses.data?.filter((course) => course.status === "published").length ?? 0;
  const draftCount = courses.data?.filter((course) => course.status === "draft").length ?? 0;

  return (
    <PageShell size="wide">
      <PageHeader
        eyebrow="Operations"
        title="Course control room"
        description="Manage Product Atelier courses, lesson readiness, publication state, and private access grants."
        actions={
          <Link to="/admin/courses/new">
            <Button>New course</Button>
          </Link>
        }
      />

      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md" mb="lg">
        <Surface padding="md" className="pc-admin-stat">
          <Text className="pc-eyebrow">Catalog</Text>
          <Title order={2}>{courses.data?.length ?? 0}</Title>
          <Text c="dimmed" size="sm">
            Total courses
          </Text>
        </Surface>
        <Surface padding="md" className="pc-admin-stat">
          <Text className="pc-eyebrow">Live</Text>
          <Title order={2}>{publishedCount}</Title>
          <Text c="dimmed" size="sm">
            Published courses
          </Text>
        </Surface>
        <Surface padding="md" className="pc-admin-stat">
          <Text className="pc-eyebrow">Pipeline</Text>
          <Title order={2}>{draftCount}</Title>
          <Text c="dimmed" size="sm">
            Draft courses
          </Text>
        </Surface>
      </SimpleGrid>

      <DataTableShell
        title="Course catalog"
        description="Create the course shells students can later browse, access, and watch."
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
