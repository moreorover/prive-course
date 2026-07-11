import { Stream, type StreamPlayerApi } from "@cloudflare/stream-react";
import { Badge, Button, Group, Paper, Stack, Text } from "@mantine/core";
import { useMutation } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";
import { trpc } from "@/utils/trpc";

const progressSaveIntervalMs = 15_000;
const progressSaveDeltaSeconds = 5;

function formatProgress(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return minutes > 0 ? `${minutes}m ${remainingSeconds}s` : `${remainingSeconds}s`;
}

export function LessonPlayer({
  lessonId,
  videoUid,
  initialProgressSeconds = 0,
  isCompleted = false,
  onProgressSaved,
}: {
  lessonId: string;
  videoUid: string | null;
  initialProgressSeconds?: number;
  isCompleted?: boolean;
  onProgressSaved?: () => Promise<unknown> | unknown;
}) {
  const streamRef = useRef<StreamPlayerApi | undefined>(undefined);
  const lastSaveAtRef = useRef(0);
  const lastSavedSecondsRef = useRef(initialProgressSeconds);
  const completedRef = useRef(isCompleted);
  const [savedSeconds, setSavedSeconds] = useState(initialProgressSeconds);
  const completed = isCompleted || completedRef.current;
  const playbackToken = useMutation(
    trpc.courses.createPlaybackToken.mutationOptions({
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );
  const heartbeat = useMutation(trpc.courses.heartbeatPlayback.mutationOptions());
  const updateProgress = useMutation(
    trpc.courses.updateProgress.mutationOptions({
      onSuccess: async (progress) => {
        lastSavedSecondsRef.current = progress.progressSeconds;
        setSavedSeconds(progress.progressSeconds);

        if (progress.completedAt) {
          completedRef.current = true;
        }

        await onProgressSaved?.();
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );
  const session = authClient.useSession();
  const playbackSessionId = playbackToken.data?.playbackSessionId;
  const watermarkText = session.data?.user.email ?? session.data?.user.name ?? "Prive Course";

  useEffect(() => {
    lastSaveAtRef.current = 0;
    lastSavedSecondsRef.current = initialProgressSeconds;
    completedRef.current = isCompleted;
    setSavedSeconds(initialProgressSeconds);
  }, [initialProgressSeconds, isCompleted, lessonId]);

  useEffect(() => {
    if (!playbackSessionId) {
      return;
    }

    const intervalId = window.setInterval(() => {
      heartbeat.mutate({ playbackSessionId });
    }, 30_000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [heartbeat, playbackSessionId]);

  const saveProgress = useCallback(
    ({ completed: nextCompleted = false, force = false } = {}) => {
      if (completedRef.current && !nextCompleted) {
        return;
      }

      const player = streamRef.current;
      if (!player || updateProgress.isPending) {
        return;
      }

      const currentSeconds = Number.isFinite(player.currentTime)
        ? Math.max(0, Math.floor(player.currentTime))
        : 0;
      const durationSeconds = Number.isFinite(player.duration)
        ? Math.max(0, Math.floor(player.duration))
        : 0;
      const progressSeconds = nextCompleted
        ? Math.max(currentSeconds, durationSeconds, lastSavedSecondsRef.current)
        : Math.max(currentSeconds, lastSavedSecondsRef.current);

      if (!nextCompleted && progressSeconds === 0) {
        return;
      }

      const now = Date.now();
      const saveDelta = progressSeconds - lastSavedSecondsRef.current;

      if (!force && now - lastSaveAtRef.current < progressSaveIntervalMs) {
        return;
      }

      if (!nextCompleted && saveDelta < progressSaveDeltaSeconds) {
        return;
      }

      lastSaveAtRef.current = now;

      if (nextCompleted) {
        completedRef.current = true;
      }

      updateProgress.mutate({
        lessonId,
        progressSeconds,
        completed: nextCompleted,
      });
    },
    [lessonId, updateProgress],
  );

  if (!videoUid) {
    return (
      <Paper withBorder radius="sm" p="md">
        <div className="grid aspect-video place-items-center border border-dashed">
          <Text fw={600}>No video uploaded</Text>
        </div>
      </Paper>
    );
  }

  if (playbackToken.data) {
    return (
      <Paper withBorder radius="sm" p="md">
        <Stack gap="md">
          <div className="relative aspect-video overflow-hidden bg-black">
            <Stream
              controls
              streamRef={streamRef}
              title="Lesson video"
              src={playbackToken.data.token}
              startTime={completed ? 0 : initialProgressSeconds}
              onTimeUpdate={() => saveProgress()}
              onPause={() => saveProgress({ force: true })}
              onEnded={() => saveProgress({ completed: true, force: true })}
            />
            <div className="pointer-events-none absolute inset-0 grid grid-cols-2 grid-rows-2 text-xs font-medium text-white/35">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex items-center justify-center">
                  <span className="rotate-[-18deg] rounded bg-black/20 px-2 py-1">
                    {watermarkText}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <Group justify="space-between">
            <Text c="dimmed">Saved at {formatProgress(savedSeconds)}</Text>
            {completed ? <Badge color="green">Complete</Badge> : null}
          </Group>
        </Stack>
      </Paper>
    );
  }

  return (
    <Paper withBorder radius="sm" p="md">
      <div className="grid aspect-video place-items-center border border-dashed">
        <Stack align="center" gap="xs">
          <Text fw={600}>Video is protected</Text>
          <Text c="dimmed" ta="center" maw={480}>
            Start playback to create a signed Cloudflare Stream token for this lesson.
          </Text>
          <Button
            loading={playbackToken.isPending}
            onClick={() => {
              playbackToken.mutate({ lessonId });
            }}
          >
            Start playback
          </Button>
          {playbackToken.isError ? <Text c="red">{playbackToken.error.message}</Text> : null}
        </Stack>
      </div>
    </Paper>
  );
}
