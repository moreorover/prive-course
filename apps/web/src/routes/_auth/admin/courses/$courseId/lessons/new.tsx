import { Button, Stack } from "@mantine/core";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { LessonForm, type LessonFormValue } from "@/components/lesson-form";
import { queryClient, trpc } from "@/utils/trpc";

function courseQueryOptions(courseId: string) {
  return trpc.admin.getCourse.queryOptions({ id: courseId });
}

function lessonsQueryOptions(courseId: string) {
  return trpc.admin.listLessons.queryOptions({ courseId });
}

export const Route = createFileRoute("/_auth/admin/courses/$courseId/lessons/new")({
  component: NewLessonRoute,
  loader: async ({ context, params }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(courseQueryOptions(params.courseId)),
      context.queryClient.ensureQueryData(lessonsQueryOptions(params.courseId)),
    ]);
  },
});

function NewLessonRoute() {
  const { courseId } = Route.useParams();
  const navigate = useNavigate();
  const lessons = useQuery(lessonsQueryOptions(courseId));
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
    <main className="mx-auto w-full max-w-3xl px-4 py-8">
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
            position: lessons.data?.length ?? 0,
            videoUid: "",
            durationSeconds: null,
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
    </main>
  );
}
