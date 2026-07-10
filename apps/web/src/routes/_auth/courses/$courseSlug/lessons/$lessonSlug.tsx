import {
  Badge,
  Button,
  Checkbox,
  Group,
  NumberInput,
  Paper,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";

import { LessonPlayer } from "@/features/course/lesson-player";
import { queryClient, trpc } from "@/utils/trpc";

function lessonQueryOptions(courseSlug: string, lessonSlug: string) {
  return trpc.courses.lessonBySlug.queryOptions({
    courseSlug,
    lessonSlug,
  });
}

export const Route = createFileRoute("/_auth/courses/$courseSlug/lessons/$lessonSlug")({
  component: LessonRoute,
  loader: async ({ context, params }) => {
    await context.queryClient.ensureQueryData(
      lessonQueryOptions(params.courseSlug, params.lessonSlug),
    );
  },
});

function LessonRoute() {
  const { courseSlug, lessonSlug } = Route.useParams();
  const lesson = useQuery(lessonQueryOptions(courseSlug, lessonSlug));
  const progressForm = useForm({
    mode: "uncontrolled",
    initialValues: {
      progressSeconds: lesson.data?.progress?.progressSeconds ?? 0,
      completed: Boolean(lesson.data?.progress?.completedAt),
    },
    validate: {
      progressSeconds: (value) =>
        Number.isInteger(value) && value >= 0 ? null : "Progress must be 0 or greater",
    },
  });
  const updateProgress = useMutation(
    trpc.courses.updateProgress.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: trpc.courses.lessonBySlug.queryKey({ courseSlug, lessonSlug }),
        });
        toast.success("Progress saved");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8">
      <Stack gap="lg">
        <Link to="/courses/$courseSlug" params={{ courseSlug }}>
          <Button variant="subtle">Back to course</Button>
        </Link>

        {lesson.data ? (
          <>
            <div>
              <Group gap="sm">
                <Title order={1}>{lesson.data.lesson.title}</Title>
                <Badge variant="light">{lesson.data.lesson.status}</Badge>
              </Group>
              <Text c="dimmed">{lesson.data.course.title}</Text>
            </div>

            <LessonPlayer lessonId={lesson.data.lesson.id} videoUid={lesson.data.lesson.videoUid} />

            {lesson.data.lesson.description ? (
              <Paper withBorder radius="sm" p="md">
                <Text>{lesson.data.lesson.description}</Text>
              </Paper>
            ) : null}

            <Paper withBorder radius="sm" p="md">
              <form
                onSubmit={progressForm.onSubmit((value) =>
                  updateProgress.mutate({
                    lessonId: lesson.data.lesson.id,
                    progressSeconds: value.progressSeconds,
                    completed: value.completed,
                  }),
                )}
              >
                <Stack gap="md">
                  <Group justify="space-between" align="center">
                    <div>
                      <Title order={2} size="h4">
                        Progress
                      </Title>
                      <Text c="dimmed">
                        {lesson.data.progress?.completedAt
                          ? "Completed"
                          : `${lesson.data.progress?.progressSeconds ?? 0} seconds saved`}
                      </Text>
                    </div>
                    {lesson.data.progress?.completedAt ? (
                      <Badge color="green">Complete</Badge>
                    ) : null}
                  </Group>
                  <NumberInput
                    label="Progress seconds"
                    min={0}
                    allowDecimal={false}
                    key={progressForm.key("progressSeconds")}
                    {...progressForm.getInputProps("progressSeconds")}
                  />
                  <Checkbox
                    label="Mark lesson complete"
                    key={progressForm.key("completed")}
                    {...progressForm.getInputProps("completed", { type: "checkbox" })}
                  />
                  <Button type="submit" loading={updateProgress.isPending}>
                    Save progress
                  </Button>
                </Stack>
              </form>
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
