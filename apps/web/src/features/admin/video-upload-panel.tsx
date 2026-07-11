import {
  Alert,
  Badge,
  Button,
  FileInput,
  Group,
  Paper,
  Progress,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { queryClient, trpc } from "@/utils/trpc";

const directUploadRecommendedMaxBytes = 200 * 1024 * 1024;

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

function formatBytes(bytes: number) {
  const megabytes = bytes / 1024 / 1024;

  return `${megabytes.toFixed(megabytes >= 10 ? 0 : 1)} MB`;
}

async function readUploadError(response: Response) {
  const responseText = await response.text().catch(() => "");

  if (!responseText) {
    return `Video upload failed with status ${response.status}`;
  }

  try {
    const payload = JSON.parse(responseText) as {
      errors?: Array<{ message?: string } | string>;
      messages?: Array<{ message?: string } | string>;
    };
    const details = [...(payload.errors ?? []), ...(payload.messages ?? [])]
      .flatMap((item) => {
        const message = typeof item === "string" ? item : item.message;

        return message ? [message] : [];
      })
      .join(" ");

    return details || `Video upload failed with status ${response.status}`;
  } catch {
    return responseText.slice(0, 240) || `Video upload failed with status ${response.status}`;
  }
}

function uploadFile(uploadUrl: string, file: File, onProgress: (progress: number) => void) {
  return new Promise<void>((resolve, reject) => {
    const request = new XMLHttpRequest();
    const formData = new FormData();
    formData.append("file", file);

    request.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    });
    request.addEventListener("load", () => {
      if (request.status >= 200 && request.status < 300) {
        onProgress(100);
        resolve();
        return;
      }

      reject(
        new Error(
          request.responseText.slice(0, 240) || `Video upload failed with status ${request.status}`,
        ),
      );
    });
    request.addEventListener("error", () => reject(new Error("Video upload failed")));
    request.addEventListener("abort", () => reject(new Error("Video upload was cancelled")));
    request.open("POST", uploadUrl);
    request.send(formData);
  });
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
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
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

    setUploadError(null);
    setUploadProgress(0);
    setIsUploading(true);
    try {
      const upload = await createUploadUrl.mutateAsync({
        lessonId,
        maxDurationSeconds: 3600,
      });
      await uploadFile(upload.uploadURL, videoFile, setUploadProgress).catch(async (error) => {
        if (error instanceof Error && error.message.startsWith("{")) {
          throw new Error(await readUploadError(new Response(error.message)));
        }

        throw error;
      });

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
      const message = error instanceof Error ? error.message : "Video upload failed";
      setUploadError(message);
      toast.error(message);
    } finally {
      setIsUploading(false);
    }
  }

  const status = videoStatus.data?.status;
  const fileTooLargeForBasicUpload =
    videoFile !== null && videoFile.size > directUploadRecommendedMaxBytes;

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
          description="Use files under 200 MB for the current direct upload flow."
          label="Video file"
          value={videoFile}
          onChange={(file) => {
            setUploadError(null);
            setUploadProgress(0);
            setVideoFile(file);
          }}
        />
        {videoFile ? (
          <Text c="dimmed" size="sm">
            Selected {videoFile.name} ({formatBytes(videoFile.size)})
          </Text>
        ) : null}
        {fileTooLargeForBasicUpload ? (
          <Alert color="yellow" title="Large upload">
            This file is larger than 200 MB. The current direct upload flow is intended for smaller
            files; use a smaller test file until tus uploads are added.
          </Alert>
        ) : null}
        {isUploading ? (
          <Stack gap={4}>
            <Progress value={uploadProgress} />
            <Text c="dimmed" size="sm">
              Uploading {uploadProgress}%
            </Text>
          </Stack>
        ) : null}
        {uploadError ? (
          <Alert color="red" title="Upload failed">
            {uploadError}
          </Alert>
        ) : null}
        <Group justify="flex-end">
          <Button
            loading={isUploading || createUploadUrl.isPending}
            disabled={!videoFile || fileTooLargeForBasicUpload}
            onClick={uploadVideo}
          >
            Upload video
          </Button>
        </Group>
      </Stack>
    </Paper>
  );
}
