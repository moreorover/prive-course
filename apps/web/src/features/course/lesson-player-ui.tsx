import { Stream, type StreamPlayerApi } from "@cloudflare/stream-react";
import { Alert, Badge, Button, Group, Paper, Stack, Text } from "@mantine/core";
import type { RefObject } from "react";

export function NoVideoPanel() {
  return (
    <Paper withBorder p="md" className="pc-panel">
      <div
        className="grid aspect-video place-items-center border border-dashed"
        style={{ borderColor: "var(--pc-border)", background: "var(--pc-panel-soft)" }}
      >
        <Stack align="center" gap={4}>
          <Text fw={700}>No video uploaded</Text>
          <Text c="dimmed" ta="center">
            This lesson does not have a video yet.
          </Text>
        </Stack>
      </div>
    </Paper>
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
    <Paper withBorder p="md" className="pc-panel">
      <div
        className="grid aspect-video place-items-center border border-dashed"
        style={{ borderColor: "var(--pc-border)", background: "var(--pc-panel-soft)" }}
      >
        <Stack align="center" gap="xs">
          <Text fw={700}>Video is protected</Text>
          <Text c="dimmed" ta="center" maw={480}>
            Start playback when you're ready.
          </Text>
          <Button loading={isPending} onClick={onStart}>
            Start playback
          </Button>
          {errorMessage ? <Text c="red">{errorMessage}</Text> : null}
        </Stack>
      </div>
    </Paper>
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
    <Paper withBorder p="md" className="pc-panel">
      <Stack gap="md">
        <div className="relative aspect-video overflow-hidden bg-black">
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
            <div className="pointer-events-none absolute inset-0 grid grid-cols-2 grid-rows-2 text-xs font-medium text-white/35">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex items-center justify-center">
                  <span className="rotate-[-18deg] rounded bg-black/20 px-2 py-1">
                    {watermarkText}
                  </span>
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
    </Paper>
  );
}
