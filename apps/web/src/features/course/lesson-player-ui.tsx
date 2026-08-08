import { Stream, type StreamPlayerApi } from "@cloudflare/stream-react";
import { Alert, Badge, Button, Group, Stack, Text } from "@mantine/core";
import type { RefObject } from "react";

import { Surface } from "@/components/ui";

export function NoVideoPanel() {
  return (
    <Surface className="pc-player-panel">
      <div className="pc-video-placeholder">
        <Stack align="center" gap={4}>
          <Text fw={700}>No video uploaded</Text>
          <Text c="dimmed" ta="center">
            This lesson does not have a video yet.
          </Text>
        </Stack>
      </div>
    </Surface>
  );
}

export function ProtectedVideoPanel({
  errorMessage,
  isPending,
  onStart,
}: {
  errorMessage?: string;
  isPending: boolean;
  onStart: () => void;
}) {
  return (
    <Surface className="pc-player-panel">
      <div className="pc-video-placeholder">
        <Stack align="center" gap="xs">
          <Text fw={700}>Video is protected</Text>
          <Text c="dimmed" ta="center" maw={480}>
            Start playback when you are ready.
          </Text>
          <Button loading={isPending} onClick={onStart}>
            Start playback
          </Button>
          {errorMessage ? <Text c="red">{errorMessage}</Text> : null}
        </Stack>
      </div>
    </Surface>
  );
}

export function ActiveVideoPanel({
  completed,
  isTokenPending,
  onCanPlay,
  onEnded,
  onError,
  onPause,
  onRetry,
  onTimeUpdate,
  playerError,
  savedProgressLabel,
  showWatermark,
  startTime,
  streamRef,
  token,
  watermarkText,
}: {
  completed: boolean;
  isTokenPending: boolean;
  onCanPlay: () => void;
  onEnded: () => void;
  onError: () => void;
  onPause: () => void;
  onRetry: () => void;
  onTimeUpdate: () => void;
  playerError: string | null;
  savedProgressLabel: string;
  showWatermark: boolean;
  startTime: number;
  streamRef: RefObject<StreamPlayerApi | undefined>;
  token: string;
  watermarkText: string;
}) {
  return (
    <Surface className="pc-player-panel">
      <Stack gap="md">
        <div className="pc-video-frame">
          <Stream
            controls
            streamRef={streamRef}
            title="Lesson video"
            src={token}
            startTime={startTime}
            onCanPlay={onCanPlay}
            onError={onError}
            onTimeUpdate={onTimeUpdate}
            onPause={onPause}
            onEnded={onEnded}
          />
          {showWatermark ? (
            <div className="pc-video-watermark">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="pc-video-watermark__cell">
                  <span className="pc-video-watermark__text">{watermarkText}</span>
                </div>
              ))}
            </div>
          ) : null}
        </div>
        <Group justify="space-between" gap="md">
          <Text c="dimmed">Saved at {savedProgressLabel}</Text>
          {completed ? <Badge color="green">Complete</Badge> : null}
        </Group>
        {playerError ? (
          <Alert color="red" title="Playback failed">
            <Stack gap="sm">
              <Text>{playerError}</Text>
              <Group>
                <Button variant="light" loading={isTokenPending} onClick={onRetry}>
                  Try again
                </Button>
              </Group>
            </Stack>
          </Alert>
        ) : null}
      </Stack>
    </Surface>
  );
}
