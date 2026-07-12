import { Button, Paper, Stack, Text } from "@mantine/core";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";

import { LessonForm, type LessonFormValue } from "@/components/lesson-form";
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
    <main className="mx-auto w-full max-w-3xl px-4 py-8">
      <Stack gap="lg">
        <Link to="/admin/courses/$courseId" params={{ courseId }}>
          <Button variant="subtle">Back to course</Button>
        </Link>

        {lesson.data ? (
          <>
            <LessonForm
              title="Edit lesson"
              submitLabel="Save changes"
              isSubmitting={updateLesson.isPending}
              initialValue={{
                title: lesson.data.title,
                slug: lesson.data.slug,
                description: lesson.data.description ?? "",
                position: lesson.data.position,
                durationSeconds: lesson.data.durationSeconds,
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
          </>
        ) : (
          <Paper withBorder p="lg" radius="sm">
            <Text c="dimmed">{lesson.isLoading ? "Loading lesson..." : "Lesson unavailable."}</Text>
          </Paper>
        )}
      </Stack>
    </main>
  );
}
