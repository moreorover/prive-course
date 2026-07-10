import { Button, Paper, Stack, Text } from "@mantine/core";
import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";
import { trpc } from "@/utils/trpc";

export function LessonPlayer({
  lessonId,
  videoUid,
}: {
  lessonId: string;
  videoUid: string | null;
}) {
  const playbackToken = useMutation(
    trpc.courses.createPlaybackToken.mutationOptions({
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );
  const heartbeat = useMutation(trpc.courses.heartbeatPlayback.mutationOptions());
  const session = authClient.useSession();
  const playbackSessionId = playbackToken.data?.playbackSessionId;
  const watermarkText = session.data?.user.email ?? session.data?.user.name ?? "Prive Course";

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
        <div className="relative aspect-video overflow-hidden">
          <iframe
            title="Lesson video"
            src={playbackToken.data.iframeUrl}
            className="h-full w-full border-0"
            allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
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
