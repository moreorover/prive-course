import { Stack, Text } from "@mantine/core";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";

import { LessonForm, type LessonFormValue } from "@/components/lesson-form";
import { PageHeader, PageShell, Surface } from "@/components/ui";
import { VideoUploadPanel } from "@/features/admin/video-upload-panel";
import { queryClient, trpc } from "@/utils/trpc";

function lessonQueryOptions(lessonId: string) {
  return trpc.admin.getLesson.queryOptions({ id: lessonId });
}

export const Route = createFileRoute("/_auth/admin/courses/$courseId/lessons/$lessonId")({
  component: EditLessonRoute,
  loader: async ({ context, params }) => {
    await context.queryClient.ensureQueryData(lessonQueryOptions(params.lessonId));
  },
});

function EditLessonRoute() {
  const { courseId, lessonId } = Route.useParams();
  const lesson = useQuery(lessonQueryOptions(lessonId));
  const updateLesson = useMutation(
    trpc.admin.updateLesson.mutationOptions({
      onSuccess: async () => {
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: trpc.admin.listLessons.queryKey({ courseId }),
          }),
          queryClient.invalidateQueries({
            queryKey: trpc.admin.getLesson.queryKey({ id: lessonId }),
          }),
        ]);
        toast.success("Lesson updated");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );

  return (
    <PageShell size="wide">
      <PageHeader
        title={lesson.data?.title ?? "Edit lesson"}
        description="Update lesson details and manage its protected video."
        backTo={{ to: "/admin/courses/$courseId", params: { courseId }, label: "Back to course" }}
      />

      {lesson.data ? (
        <Stack gap="xl">
          <LessonForm
            title="Edit lesson"
            submitLabel="Save changes"
            isSubmitting={updateLesson.isPending}
            initialValue={{
              title: lesson.data.title,
              slug: lesson.data.slug,
              description: lesson.data.description ?? "",
              isFree: lesson.data.isFree,
              status: lesson.data.status,
            }}
            onSubmit={(value: LessonFormValue) => updateLesson.mutate({ id: lessonId, ...value })}
          />

          <VideoUploadPanel
            courseId={courseId}
            lessonId={lessonId}
            videoUid={lesson.data.videoUid}
          />
        </Stack>
      ) : (
        <Surface>
          <Text c="dimmed">{lesson.isLoading ? "Loading lesson..." : "Lesson unavailable."}</Text>
        </Surface>
      )}
    </PageShell>
  );
}
