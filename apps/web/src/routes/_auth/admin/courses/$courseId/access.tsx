import { Badge, Button, Table, Text, TextInput } from "@mantine/core";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { DataTableShell, PageHeader, PageShell } from "@/components/ui";
import { trpc } from "@/utils/trpc";

function courseQueryOptions(courseId: string) {
  return trpc.admin.getCourse.queryOptions({ id: courseId });
}

function accessQueryOptions(courseId: string) {
  return trpc.admin.listCourseAccess.queryOptions({ courseId });
}

function usersQueryOptions(query: string) {
  return trpc.admin.searchUsers.queryOptions({ query });
}

export const Route = createFileRoute("/_auth/admin/courses/$courseId/access")({
  component: CourseAccessRoute,
  loader: async ({ context, params }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(courseQueryOptions(params.courseId)),
      context.queryClient.ensureQueryData(accessQueryOptions(params.courseId)),
      context.queryClient.ensureQueryData(usersQueryOptions("")),
    ]);
  },
});

function CourseAccessRoute() {
  const { courseId } = Route.useParams();
  const [query, setQuery] = useState("");
  const course = useQuery(courseQueryOptions(courseId));
  const access = useQuery(accessQueryOptions(courseId));
  const users = useQuery(usersQueryOptions(query));
  const grantAccess = useMutation(
    trpc.admin.grantCourseAccess.mutationOptions({
      onSuccess: async () => {
        await access.refetch();
        toast.success("Access granted");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );
  const revokeAccess = useMutation(
    trpc.admin.revokeCourseAccess.mutationOptions({
      onSuccess: async () => {
        await access.refetch();
        toast.success("Access revoked");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );
  const activeUserIds = new Set(access.data?.map((item) => item.userId) ?? []);

  return (
    <PageShell size="wide">
      <PageHeader
        title="Course access"
        description={course.data?.title ?? "Manage course access."}
        backTo={{ to: "/admin/courses/$courseId", params: { courseId }, label: "Back to course" }}
      />

      <div className="pc-admin-grid">
        <DataTableShell title="Grant access" description="Search users and grant this course.">
          <TextInput
            label="Search users"
            placeholder="Email or name"
            value={query}
            onChange={(event) => setQuery(event.currentTarget.value)}
          />
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>User</Table.Th>
                <Table.Th>Email</Table.Th>
                <Table.Th>Role</Table.Th>
                <Table.Th />
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {users.data?.map((user) => {
                const hasAccess = activeUserIds.has(user.id);

                return (
                  <Table.Tr key={user.id}>
                    <Table.Td>{user.name}</Table.Td>
                    <Table.Td>{user.email}</Table.Td>
                    <Table.Td>
                      <Badge variant="light">{user.role ?? "user"}</Badge>
                    </Table.Td>
                    <Table.Td className="pc-table-action">
                      <Button
                        size="xs"
                        variant={hasAccess ? "default" : "light"}
                        disabled={hasAccess || grantAccess.isPending}
                        onClick={() => grantAccess.mutate({ courseId, userId: user.id })}
                      >
                        {hasAccess ? "Granted" : "Grant"}
                      </Button>
                    </Table.Td>
                  </Table.Tr>
                );
              })}
            </Table.Tbody>
          </Table>
        </DataTableShell>

        <DataTableShell
          title="Active access"
          description="Revoke access when a student should no longer watch this course."
        >
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>User</Table.Th>
                <Table.Th>Email</Table.Th>
                <Table.Th>Granted</Table.Th>
                <Table.Th />
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {access.data?.map((item) => (
                <Table.Tr key={item.id}>
                  <Table.Td>{item.userName}</Table.Td>
                  <Table.Td>{item.userEmail}</Table.Td>
                  <Table.Td>{new Date(item.grantedAt).toLocaleDateString()}</Table.Td>
                  <Table.Td className="pc-table-action">
                    <Button
                      color="red"
                      size="xs"
                      variant="light"
                      loading={revokeAccess.isPending}
                      onClick={() => revokeAccess.mutate({ courseId, userId: item.userId })}
                    >
                      Revoke
                    </Button>
                  </Table.Td>
                </Table.Tr>
              ))}
              {access.data?.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={4}>
                    <Text c="dimmed">No users currently have access.</Text>
                  </Table.Td>
                </Table.Tr>
              ) : null}
            </Table.Tbody>
          </Table>
        </DataTableShell>
      </div>
    </PageShell>
  );
}
