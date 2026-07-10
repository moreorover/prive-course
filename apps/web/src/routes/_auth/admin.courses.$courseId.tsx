import { Button, Paper, Stack, Text } from "@mantine/core";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";

import { CourseForm, type CourseFormValue } from "@/components/course-form";
import { queryClient, trpc } from "@/utils/trpc";

function courseQueryOptions(courseId: string) {
  return trpc.admin.getCourse.queryOptions({ id: courseId });
}

export const Route = createFileRoute("/_auth/admin/courses/$courseId")({
  component: EditCourseRoute,
  loader: async ({ context, params }) => {
    await context.queryClient.ensureQueryData(courseQueryOptions(params.courseId));
  },
});

function EditCourseRoute() {
  const { courseId } = Route.useParams();
  const course = useQuery(courseQueryOptions(courseId));
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
    <main className="mx-auto w-full max-w-3xl px-4 py-8">
      <Stack gap="lg">
        <Link to="/admin">
          <Button variant="subtle">Back to courses</Button>
        </Link>

        {course.data ? (
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
        ) : (
          <Paper withBorder p="lg" radius="sm">
            <Text c="dimmed">{course.isLoading ? "Loading course..." : "Course unavailable."}</Text>
          </Paper>
        )}
      </Stack>
    </main>
  );
}
