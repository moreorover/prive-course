import { Button, FileInput, Group, Paper, Stack, Text, Title } from "@mantine/core";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { LessonForm, type LessonFormValue } from "@/components/lesson-form";
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
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
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
  const createUploadUrl = useMutation(
    trpc.admin.createLessonUploadUrl.mutationOptions({
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );

  async function uploadVideo() {
    if (!videoFile) {
      return;
    }

    setIsUploading(true);
    try {
      const upload = await createUploadUrl.mutateAsync({
        lessonId,
        maxDurationSeconds: 3600,
      });
      const formData = new FormData();
      formData.append("file", videoFile);

      const response = await fetch(upload.uploadURL, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Video upload failed");
      }

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: trpc.admin.listLessons.queryKey({ courseId }),
        }),
        queryClient.invalidateQueries({
          queryKey: trpc.admin.getLesson.queryKey({ id: lessonId }),
        }),
      ]);
      setVideoFile(null);
      toast.success("Video uploaded");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Video upload failed");
    } finally {
      setIsUploading(false);
    }
  }

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
                videoUid: lesson.data.videoUid ?? "",
                durationSeconds: lesson.data.durationSeconds,
                status: lesson.data.status,
              }}
              onSubmit={(value: LessonFormValue) => updateLesson.mutate({ id: lessonId, ...value })}
            />

            <Paper withBorder p="md" radius="sm">
              <Stack gap="md">
                <div>
                  <Title order={2} size="h4">
                    Video
                  </Title>
                  <Text c="dimmed">
                    {lesson.data.videoUid
                      ? `Cloudflare Stream UID: ${lesson.data.videoUid}`
                      : "No video uploaded yet."}
                  </Text>
                </div>
                <FileInput
                  accept="video/*"
                  clearable
                  label="Video file"
                  value={videoFile}
                  onChange={setVideoFile}
                />
                <Group justify="flex-end">
                  <Button
                    loading={isUploading || createUploadUrl.isPending}
                    disabled={!videoFile}
                    onClick={uploadVideo}
                  >
                    Upload video
                  </Button>
                </Group>
              </Stack>
            </Paper>
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
