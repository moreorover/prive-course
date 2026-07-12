import type { StreamPlayerApi } from "@cloudflare/stream-react";
import { useMutation } from "@tanstack/react-query";
import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";
import { trpc } from "@/utils/trpc";

import { ActiveVideoPanel, NoVideoPanel, ProtectedVideoPanel } from "./lesson-player-ui";

const localProgressDeltaSeconds = 5;

type LocalLessonProgress = {
  completed: boolean;
  progressSeconds: number;
  serverCompleted: boolean;
  updatedAt: number;
};

function getProgressStorageKey(lessonId: string) {
  return `prive-course:lesson-progress:${lessonId}`;
}

function readLocalProgress(lessonId: string): LocalLessonProgress | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const rawProgress = window.localStorage.getItem(getProgressStorageKey(lessonId));

    if (!rawProgress) {
      return null;
    }

    const parsedProgress = JSON.parse(rawProgress) as Partial<LocalLessonProgress>;
    const progressSeconds = Math.max(0, Math.floor(parsedProgress.progressSeconds ?? 0));

    return {
      completed: Boolean(parsedProgress.completed),
      progressSeconds,
      serverCompleted: Boolean(parsedProgress.serverCompleted ?? parsedProgress.completed),
      updatedAt: typeof parsedProgress.updatedAt === "number" ? parsedProgress.updatedAt : 0,
    };
  } catch {
    return null;
  }
}

function writeLocalProgress(lessonId: string, progress: LocalLessonProgress) {
  try {
    window.localStorage.setItem(getProgressStorageKey(lessonId), JSON.stringify(progress));
  } catch {
    // Local progress is a best-effort cache; server sync still runs on exit.
  }
}

function formatProgress(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return minutes > 0 ? `${minutes}m ${remainingSeconds}s` : `${remainingSeconds}s`;
}

function getResumeSeconds(progressSeconds: number, durationSeconds?: number | null) {
  if (progressSeconds <= 0) {
    return 0;
  }

  if (durationSeconds && progressSeconds >= durationSeconds) {
    return 0;
  }

  return progressSeconds;
}

export function LessonPlayer({
  lessonId,
  videoUid,
  durationSeconds,
  initialProgressSeconds = 0,
  isCompleted = false,
  onProgressSaved,
}: {
  lessonId: string;
  videoUid: string | null;
  durationSeconds?: number | null;
  initialProgressSeconds?: number;
  isCompleted?: boolean;
  onProgressSaved?: () => Promise<unknown> | unknown;
}) {
  const streamRef = useRef<StreamPlayerApi | undefined>(undefined);
  const [initialLocalProgress] = useState(() => readLocalProgress(lessonId));
  const initialStoredProgressSeconds = Math.max(
    initialProgressSeconds,
    initialLocalProgress?.progressSeconds ?? 0,
  );
  const initialEffectiveProgressSeconds = getResumeSeconds(
    initialStoredProgressSeconds,
    durationSeconds,
  );
  const initialEffectiveCompleted = isCompleted || Boolean(initialLocalProgress?.completed);
  const progressRef = useRef<LocalLessonProgress>({
    completed: initialEffectiveCompleted,
    progressSeconds: initialEffectiveProgressSeconds,
    serverCompleted: initialEffectiveCompleted,
    updatedAt: initialLocalProgress?.updatedAt ?? Date.now(),
  });
  const initialProgressSecondsRef = useRef(initialProgressSeconds);
  const lastLocalProgressSecondsRef = useRef(initialEffectiveProgressSeconds);
  const lessonIdRef = useRef(lessonId);
  const [, refreshProgressDisplay] = useReducer((value: number) => value + 1, 0);
  const [playerError, setPlayerError] = useState<string | null>(null);
  const savedSeconds = progressRef.current.progressSeconds;
  const completed = progressRef.current.completed || progressRef.current.serverCompleted;
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
        const currentProgress = progressRef.current;
        const serverCompleted = Boolean(progress.completedAt) || currentProgress.serverCompleted;
        const keepLocalReplayProgress =
          serverCompleted &&
          currentProgress.progressSeconds > 0 &&
          currentProgress.progressSeconds < progress.progressSeconds;

        progressRef.current = {
          completed: Boolean(progress.completedAt) || currentProgress.completed,
          progressSeconds: keepLocalReplayProgress
            ? currentProgress.progressSeconds
            : progress.progressSeconds,
          serverCompleted,
          updatedAt: Date.now(),
        };
        lastLocalProgressSecondsRef.current = progressRef.current.progressSeconds;
        writeLocalProgress(lessonIdRef.current, progressRef.current);
        refreshProgressDisplay();

        await onProgressSaved?.();
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );
  const updateProgressMutateRef = useRef(updateProgress.mutate);
  const session = authClient.useSession();
  const playbackSessionId = playbackToken.data?.playbackSessionId;
  const watermarkText = session.data?.user.email ?? session.data?.user.name ?? "Prive Course";

  useEffect(() => {
    updateProgressMutateRef.current = updateProgress.mutate;
  }, [updateProgress.mutate]);

  useEffect(() => {
    const localProgress = readLocalProgress(lessonId);
    const nextStoredProgressSeconds = Math.max(
      initialProgressSeconds,
      localProgress?.progressSeconds ?? 0,
    );
    const nextProgressSeconds = getResumeSeconds(nextStoredProgressSeconds, durationSeconds);
    const nextCompleted = isCompleted || Boolean(localProgress?.completed);

    initialProgressSecondsRef.current = initialProgressSeconds;
    lessonIdRef.current = lessonId;
    progressRef.current = {
      completed: nextCompleted,
      progressSeconds: nextProgressSeconds,
      serverCompleted: nextCompleted,
      updatedAt: localProgress?.updatedAt ?? Date.now(),
    };
    lastLocalProgressSecondsRef.current = nextProgressSeconds;
    refreshProgressDisplay();
  }, [durationSeconds, initialProgressSeconds, isCompleted, lessonId]);

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

  const saveLocalProgress = useCallback(
    ({ completed: nextCompleted = false, force = false } = {}) => {
      const player = streamRef.current;
      if (!player) {
        return;
      }

      const currentSeconds = Number.isFinite(player.currentTime)
        ? Math.max(0, Math.floor(player.currentTime))
        : 0;
      const durationSeconds = Number.isFinite(player.duration)
        ? Math.max(0, Math.floor(player.duration))
        : 0;
      const progressSeconds = nextCompleted
        ? Math.max(currentSeconds, durationSeconds)
        : currentSeconds;

      if (!force && !nextCompleted && progressSeconds === 0) {
        return;
      }

      if (
        !force &&
        !nextCompleted &&
        progressSeconds - lastLocalProgressSecondsRef.current < localProgressDeltaSeconds
      ) {
        return;
      }

      lastLocalProgressSecondsRef.current = progressSeconds;
      progressRef.current = {
        completed: nextCompleted || progressRef.current.completed,
        progressSeconds,
        serverCompleted: progressRef.current.serverCompleted,
        updatedAt: Date.now(),
      };
      writeLocalProgress(lessonId, progressRef.current);

      refreshProgressDisplay();
    },
    [lessonId],
  );

  const flushProgress = useCallback(() => {
    saveLocalProgress({ force: true });

    const progress = progressRef.current;

    if (!session.data) {
      return;
    }

    if (progress.progressSeconds <= initialProgressSecondsRef.current && !progress.completed) {
      return;
    }

    updateProgressMutateRef.current({
      lessonId: lessonIdRef.current,
      progressSeconds: progress.progressSeconds,
      completed: progress.completed,
    });
  }, [saveLocalProgress, session.data]);

  useEffect(() => {
    const flushOnPageHide = () => flushProgress();
    const flushOnVisibilityHidden = () => {
      if (document.visibilityState === "hidden") {
        flushProgress();
      }
    };

    window.addEventListener("pagehide", flushOnPageHide);
    document.addEventListener("visibilitychange", flushOnVisibilityHidden);

    return () => {
      flushProgress();
      window.removeEventListener("pagehide", flushOnPageHide);
      document.removeEventListener("visibilitychange", flushOnVisibilityHidden);
    };
  }, [flushProgress]);

  if (!videoUid) {
    return <NoVideoPanel />;
  }

  if (playbackToken.data) {
    return (
      <ActiveVideoPanel
        completed={completed}
        isTokenPending={playbackToken.isPending}
        onCanPlay={() => setPlayerError(null)}
        onEnded={() => {
          saveLocalProgress({ completed: true, force: true });
        }}
        onError={() => {
          setPlayerError(
            "The video could not be loaded. Try starting playback again, or wait a few minutes if the video was just uploaded.",
          );
        }}
        onPause={() => saveLocalProgress({ force: true })}
        onRetry={() => {
          setPlayerError(null);
          playbackToken.reset();
          playbackToken.mutate({ lessonId });
        }}
        onTimeUpdate={() => saveLocalProgress()}
        playerError={playerError}
        savedProgressLabel={formatProgress(savedSeconds)}
        showWatermark={Boolean(session.data)}
        startTime={getResumeSeconds(savedSeconds, durationSeconds)}
        streamRef={streamRef}
        token={playbackToken.data.token}
        watermarkText={watermarkText}
      />
    );
  }

  return (
    <ProtectedVideoPanel
      errorMessage={playbackToken.isError ? playbackToken.error.message : undefined}
      isPending={playbackToken.isPending}
      onStart={() => {
        playbackToken.mutate({ lessonId });
      }}
    />
  );
}
