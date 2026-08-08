import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { CourseForm, type CourseFormValue } from "@/components/course-form";
import { PageHeader, PageShell } from "@/components/ui";
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
    <PageShell size="wide">
      <PageHeader
        title="New course"
        description="Create a course shell before adding lessons."
        backTo={{ to: "/admin", label: "Back to admin" }}
      />
      <CourseForm
        title="New course"
        submitLabel="Create course"
        isSubmitting={createCourse.isPending}
        onSubmit={(value: CourseFormValue) => createCourse.mutate(value)}
      />
    </PageShell>
  );
}
