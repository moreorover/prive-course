import { Button, Stack } from "@mantine/core";
import { useMutation } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { CourseForm, type CourseFormValue } from "@/components/course-form";
import { queryClient, trpc } from "@/utils/trpc";

export const Route = createFileRoute("/_auth/admin/courses/new")({
  component: NewCourseRoute,
});

function NewCourseRoute() {
  const navigate = useNavigate();

  const createCourse = useMutation(
    trpc.admin.createCourse.mutationOptions({
      onSuccess: async (course) => {
        await queryClient.invalidateQueries({ queryKey: trpc.admin.listCourses.queryKey() });
        toast.success("Course created");
        await navigate({ to: "/admin/courses/$courseId", params: { courseId: course.id } });
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );

  return (
    <main className="pc-page-narrow">
      <Stack gap="lg">
        <Link to="/admin">
          <Button variant="subtle">Back to courses</Button>
        </Link>
        <CourseForm
          title="New course"
          submitLabel="Create course"
          isSubmitting={createCourse.isPending}
          onSubmit={(value: CourseFormValue) => createCourse.mutate(value)}
        />
      </Stack>
    </main>
  );
}
