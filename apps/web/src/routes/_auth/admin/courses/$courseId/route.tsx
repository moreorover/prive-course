import { Badge, Button, Group, Paper, Stack, Table, Text, Title } from "@mantine/core";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";

import { CourseForm, type CourseFormValue } from "@/components/course-form";
import { queryClient, trpc } from "@/utils/trpc";

function courseQueryOptions(courseId: string) {
  return trpc.admin.getCourse.queryOptions({ id: courseId });
}

function lessonsQueryOptions(courseId: string) {
  return trpc.admin.listLessons.queryOptions({ courseId });
}

export const Route = createFileRoute("/_auth/admin/courses/$courseId")({
  component: EditCourseRoute,
  loader: async ({ context, params }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(courseQueryOptions(params.courseId)),
      context.queryClient.ensureQueryData(lessonsQueryOptions(params.courseId)),
    ]);
  },
});

function EditCourseRoute() {
  const { courseId } = Route.useParams();
  const course = useQuery(courseQueryOptions(courseId));
  const lessons = useQuery(lessonsQueryOptions(courseId));
  const updateCourse = useMutation(
    trpc.admin.updateCourse.mutationOptions({
      onSuccess: async () => {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: trpc.admin.listCourses.queryKey() }),
          queryClient.invalidateQueries({
            queryKey: trpc.admin.getCourse.queryKey({ id: courseId }),
          }),
        ]);
        toast.success("Course updated");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8">
      <Stack gap="lg">
        <Link to="/admin">
          <Button variant="subtle">Back to courses</Button>
        </Link>

        {course.data ? (
          <>
            <CourseForm
              title="Edit course"
              submitLabel="Save changes"
              isSubmitting={updateCourse.isPending}
              initialValue={{
                title: course.data.title,
                slug: course.data.slug,
                description: course.data.description ?? "",
                status: course.data.status,
              }}
              onSubmit={(value: CourseFormValue) => updateCourse.mutate({ id: courseId, ...value })}
            />

            <Paper withBorder p="md" radius="sm">
              <Stack gap="md">
                <Group justify="space-between" align="center">
                  <div>
                    <Title order={2} size="h4">
                      Lessons
                    </Title>
                    <Text c="dimmed">Create and edit lessons for this course.</Text>
                  </div>
                  <Link to="/admin/courses/$courseId/lessons/new" params={{ courseId }}>
                    <Button>New lesson</Button>
                  </Link>
                </Group>

                <Table striped highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>#</Table.Th>
                      <Table.Th>Title</Table.Th>
                      <Table.Th>Slug</Table.Th>
                      <Table.Th>Status</Table.Th>
                      <Table.Th />
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {lessons.data?.map((lesson) => (
                      <Table.Tr key={lesson.id}>
                        <Table.Td>{lesson.position + 1}</Table.Td>
                        <Table.Td>{lesson.title}</Table.Td>
                        <Table.Td>{lesson.slug}</Table.Td>
                        <Table.Td>
                          <Badge variant="light">{lesson.status}</Badge>
                        </Table.Td>
                        <Table.Td>
                          <Link
                            to="/admin/courses/$courseId/lessons/$lessonId"
                            params={{ courseId, lessonId: lesson.id }}
                          >
                            <Button size="xs" variant="light">
                              Edit
                            </Button>
                          </Link>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                    {lessons.data?.length === 0 ? (
                      <Table.Tr>
                        <Table.Td colSpan={5}>
                          <Text c="dimmed">No lessons yet.</Text>
                        </Table.Td>
                      </Table.Tr>
                    ) : null}
                  </Table.Tbody>
                </Table>
              </Stack>
            </Paper>
          </>
        ) : (
          <Paper withBorder p="lg" radius="sm">
            <Text c="dimmed">{course.isLoading ? "Loading course..." : "Course unavailable."}</Text>
          </Paper>
        )}
      </Stack>
    </main>
  );
}
