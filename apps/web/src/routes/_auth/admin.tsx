import {
  Badge,
  Button,
  Group,
  Paper,
  Select,
  SimpleGrid,
  Stack,
  Table,
  Text,
  TextInput,
  Textarea,
  Title,
} from "@mantine/core";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Navigate, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { queryClient, trpc } from "@/utils/trpc";

type PublishStatus = "draft" | "published" | "archived";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

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
  const createCourse = useMutation(
    trpc.admin.createCourse.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: trpc.admin.listCourses.queryKey() });
        toast.success("Course created");
        setTitle("");
        setSlug("");
        setDescription("");
        setStatus("draft");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<PublishStatus>("draft");

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8">
      <Stack gap="lg">
        <Group justify="space-between" align="end">
          <div>
            <Title order={1}>Admin</Title>
            <Text c="dimmed">Create courses and manage publication state.</Text>
          </div>
        </Group>

        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
          <Paper withBorder p="md" radius="sm">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                createCourse.mutate({
                  title,
                  slug,
                  description,
                  status,
                });
              }}
            >
              <Stack gap="md">
                <Title order={2} size="h4">
                  New course
                </Title>
                <TextInput
                  label="Title"
                  value={title}
                  onChange={(event) => {
                    const nextTitle = event.currentTarget.value;
                    setTitle(nextTitle);
                    if (!slug) {
                      setSlug(slugify(nextTitle));
                    }
                  }}
                  required
                />
                <TextInput
                  label="Slug"
                  value={slug}
                  onChange={(event) => setSlug(slugify(event.currentTarget.value))}
                  required
                />
                <Textarea
                  label="Description"
                  value={description}
                  minRows={4}
                  onChange={(event) => setDescription(event.currentTarget.value)}
                />
                <Select
                  label="Status"
                  data={[
                    { value: "draft", label: "Draft" },
                    { value: "published", label: "Published" },
                    { value: "archived", label: "Archived" },
                  ]}
                  value={status}
                  onChange={(value) => setStatus((value as PublishStatus | null) ?? "draft")}
                />
                <Button type="submit" loading={createCourse.isPending} disabled={!title || !slug}>
                  Create course
                </Button>
              </Stack>
            </form>
          </Paper>

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
                    </Table.Tr>
                  ))}
                  {courses.data?.length === 0 ? (
                    <Table.Tr>
                      <Table.Td colSpan={3}>
                        <Text c="dimmed">No courses yet.</Text>
                      </Table.Td>
                    </Table.Tr>
                  ) : null}
                </Table.Tbody>
              </Table>
            </Stack>
          </Paper>
        </SimpleGrid>
      </Stack>
    </main>
  );
}
