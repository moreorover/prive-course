import { Badge, Button, FileInput, Group, Paper, Stack, Text, Title } from "@mantine/core";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { queryClient, trpc } from "@/utils/trpc";

function getStatusColor(state: string | undefined, readyToStream: boolean) {
  if (readyToStream || state === "ready") {
    return "green";
  }

  if (state === "error") {
    return "red";
  }

  if (!state || state === "pendingupload") {
    return "gray";
  }

  return "yellow";
}

function getStatusLabel(state: string | undefined, readyToStream: boolean) {
  if (readyToStream || state === "ready") {
    return "Ready";
  }

  if (!state) {
    return "Unknown";
  }

  return state
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (value) => value.toUpperCase());
}

export function VideoUploadPanel({
  courseId,
  lessonId,
  videoUid,
}: {
  courseId: string;
  lessonId: string;
  videoUid: string | null;
}) {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const videoStatus = useQuery({
    ...trpc.admin.getLessonVideoStatus.queryOptions({ lessonId }),
    enabled: Boolean(videoUid),
    refetchInterval: videoUid ? 15_000 : false,
  });
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
        queryClient.invalidateQueries({
          queryKey: trpc.admin.getLessonVideoStatus.queryKey({ lessonId }),
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

  const status = videoStatus.data?.status;

  return (
    <Paper withBorder p="md" radius="sm">
      <Stack gap="md">
        <div>
          <Group justify="space-between" align="center">
            <Title order={2} size="h4">
              Video
            </Title>
            {videoUid ? (
              <Badge
                color={getStatusColor(status?.state, videoStatus.data?.readyToStream ?? false)}
              >
                {videoStatus.isLoading
                  ? "Checking"
                  : getStatusLabel(status?.state, videoStatus.data?.readyToStream ?? false)}
              </Badge>
            ) : null}
          </Group>
          <Text c="dimmed">
            {videoUid ? `Cloudflare Stream UID: ${videoUid}` : "No video uploaded yet."}
          </Text>
          {status?.pctComplete ? <Text c="dimmed">Processing: {status.pctComplete}%</Text> : null}
          {status?.errorReasonText ? <Text c="red">{status.errorReasonText}</Text> : null}
          {videoStatus.isError ? <Text c="red">{videoStatus.error.message}</Text> : null}
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
  );
}
