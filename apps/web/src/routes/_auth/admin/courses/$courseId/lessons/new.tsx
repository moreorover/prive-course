import { Button, Stack } from "@mantine/core";
import { useMutation } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { LessonForm, type LessonFormValue } from "@/components/lesson-form";
import { queryClient, trpc } from "@/utils/trpc";

function courseQueryOptions(courseId: string) {
  return trpc.admin.getCourse.queryOptions({ id: courseId });
}

export const Route = createFileRoute("/_auth/admin/courses/$courseId/lessons/new")({
  component: NewLessonRoute,
  loader: async ({ context, params }) => {
    await context.queryClient.ensureQueryData(courseQueryOptions(params.courseId));
  },
});

function NewLessonRoute() {
  const { courseId } = Route.useParams();
  const navigate = useNavigate();
  const createLesson = useMutation(
    trpc.admin.createLesson.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: trpc.admin.listLessons.queryKey({ courseId }),
        });
        toast.success("Lesson created");
        await navigate({ to: "/admin/courses/$courseId", params: { courseId } });
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );

  return (
    <div className="pc-page-narrow">
      <Stack gap="lg">
        <Link to="/admin/courses/$courseId" params={{ courseId }}>
          <Button variant="subtle">Back to course</Button>
        </Link>
        <LessonForm
          title="New lesson"
          submitLabel="Create lesson"
          isSubmitting={createLesson.isPending}
          initialValue={{
            title: "",
            slug: "",
            description: "",
            isFree: false,
            status: "draft",
          }}
          onSubmit={(value: LessonFormValue) =>
            createLesson.mutate({
              courseId,
              ...value,
            })
          }
        />
      </Stack>
    </div>
  );
}
