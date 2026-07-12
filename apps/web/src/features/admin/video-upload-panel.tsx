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

const tusChunkSizeBytes = 50 * 1024 * 1024;

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

async function getTusUploadOffset(uploadUrl: string) {
  const response = await fetch(uploadUrl, {
    method: "HEAD",
    headers: {
      "Tus-Resumable": "1.0.0",
    },
  });

  if (!response.ok) {
    throw new Error(await readUploadError(response));
  }

  return Number(response.headers.get("Upload-Offset") ?? 0);
}

async function uploadFileWithTus(
  uploadUrl: string,
  file: File,
  onProgress: (progress: number) => void,
) {
  let offset = await getTusUploadOffset(uploadUrl);
  let failedAttempts = 0;

  onProgress(Math.round((offset / file.size) * 100));

  while (offset < file.size) {
    const chunk = file.slice(offset, Math.min(offset + tusChunkSizeBytes, file.size));
    const response = await fetch(uploadUrl, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/offset+octet-stream",
        "Tus-Resumable": "1.0.0",
        "Upload-Offset": String(offset),
      },
      body: chunk,
    });

    if (response.status === 409) {
      offset = await getTusUploadOffset(uploadUrl);
      failedAttempts = 0;
      continue;
    }

    if (!response.ok) {
      failedAttempts += 1;

      if (failedAttempts <= 2) {
        offset = await getTusUploadOffset(uploadUrl);
        continue;
      }

      throw new Error(await readUploadError(response));
    }

    failedAttempts = 0;
    offset = Number(response.headers.get("Upload-Offset") ?? offset + chunk.size);
    onProgress(Math.round((offset / file.size) * 100));
  }
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
  const createTusUploadUrl = useMutation(
    trpc.admin.createLessonTusUploadUrl.mutationOptions({
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
      const upload = await createTusUploadUrl.mutateAsync({
        lessonId,
        fileSize: videoFile.size,
        maxDurationSeconds: 3600,
      });

      await uploadFileWithTus(upload.uploadURL, videoFile, setUploadProgress);

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
            {videoUid
              ? "Video uploaded. Processing may continue before playback is ready."
              : "No video uploaded yet."}
          </Text>
          {status?.pctComplete ? <Text c="dimmed">Processing: {status.pctComplete}%</Text> : null}
          {status?.errorReasonText ? <Text c="red">{status.errorReasonText}</Text> : null}
          {videoStatus.isError ? <Text c="red">{videoStatus.error.message}</Text> : null}
        </div>

        <FileInput
          accept="video/*"
          clearable
          description="Choose a video file for this lesson."
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
        <Alert color="blue" title="Upload note">
          Large videos may take time to upload and process. Keep this tab open until the upload
          completes.
        </Alert>
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
            loading={isUploading || createTusUploadUrl.isPending}
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
