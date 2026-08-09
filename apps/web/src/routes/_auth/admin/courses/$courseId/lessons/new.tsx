import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { LessonForm, type LessonFormValue } from "@/components/lesson-form";
import { PageHeader, PageShell } from "@/components/ui";
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
    <PageShell size="wide">
      <PageHeader
        eyebrow="Lesson setup"
        title="Create lesson"
        description="Create the lesson shell first, then upload the protected video after the lesson exists."
        backTo={{ to: "/admin/courses/$courseId", params: { courseId }, label: "Back to course" }}
      />
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
    </PageShell>
  );
}
