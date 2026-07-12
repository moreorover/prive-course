import { Badge, Button, Group, Paper, Stack, Table, Text, Title } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";

import { EmptyState } from "@/components/empty-state";
import { trpc } from "@/utils/trpc";

function courseQueryOptions(courseSlug: string) {
  return trpc.courses.bySlug.queryOptions({ slug: courseSlug });
}

export const Route = createFileRoute("/courses/$courseSlug/")({
  component: CourseDetailRoute,
  loader: async ({ context, params }) => {
    await context.queryClient.ensureQueryData(courseQueryOptions(params.courseSlug));
  },
});

function CourseDetailRoute() {
  const { courseSlug } = Route.useParams();
  const course = useQuery(courseQueryOptions(courseSlug));

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8">
      <Stack gap="lg">
        <Link to="/courses">
          <Button variant="subtle">Back to courses</Button>
        </Link>

        {course.data ? (
          <>
            <div>
              <Group gap="sm">
                <Title order={1}>{course.data.title}</Title>
                <Badge variant="light">{course.data.status}</Badge>
              </Group>
              <Text c="dimmed">{course.data.description || "No description yet."}</Text>
            </div>

            <Paper withBorder p="md" radius="sm">
              <Stack gap="md">
                <Title order={2} size="h4">
                  Lessons
                </Title>
                {course.data.lessons.length === 0 ? (
                  <EmptyState
                    title="No published lessons"
                    description="Lessons will appear here after an admin publishes them."
                  />
                ) : (
                  <Table striped highlightOnHover>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>#</Table.Th>
                        <Table.Th>Title</Table.Th>
                        <Table.Th>Access</Table.Th>
                        <Table.Th>Duration</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {course.data.lessons.map((lesson) => {
                        const canOpenLesson = lesson.isFree || course.data.hasActiveAccess;
                        const accessLabel = lesson.isFree
                          ? "Free"
                          : course.data.hasActiveAccess
                            ? "Included"
                            : "Locked";

                        return (
                          <Table.Tr key={lesson.id}>
                            <Table.Td>{lesson.position + 1}</Table.Td>
                            <Table.Td>
                              {canOpenLesson ? (
                                <Link
                                  to="/courses/$courseSlug/lessons/$lessonSlug"
                                  params={{ courseSlug, lessonSlug: lesson.slug }}
                                >
                                  {lesson.title}
                                </Link>
                              ) : (
                                <Text>{lesson.title}</Text>
                              )}
                            </Table.Td>
                            <Table.Td>
                              <Badge
                                color={
                                  lesson.isFree
                                    ? "teal"
                                    : course.data.hasActiveAccess
                                      ? "blue"
                                      : "gray"
                                }
                                variant="light"
                              >
                                {accessLabel}
                              </Badge>
                            </Table.Td>
                            <Table.Td>
                              {lesson.durationSeconds
                                ? `${Math.round(lesson.durationSeconds / 60)} min`
                                : "Pending"}
                            </Table.Td>
                          </Table.Tr>
                        );
                      })}
                    </Table.Tbody>
                  </Table>
                )}
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
