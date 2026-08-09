import { Badge, Button, Group, Stack, Text } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute, type ErrorComponentProps } from "@tanstack/react-router";

import { PageHeader, PageShell, Surface } from "@/components/ui";
import { LessonList, LessonNavControls } from "@/features/course/lesson-navigation";
import { LessonPlayer } from "@/features/course/lesson-player";
import { queryClient, trpc } from "@/utils/trpc";

function lessonQueryOptions(courseSlug: string, lessonSlug: string) {
  return trpc.courses.lessonBySlug.queryOptions({
    courseSlug,
    lessonSlug,
  });
}

export const Route = createFileRoute("/courses/$courseSlug/lessons/$lessonSlug")({
  component: LessonRoute,
  errorComponent: LessonError,
  loader: async ({ context, params }) => {
    await context.queryClient.ensureQueryData(
      lessonQueryOptions(params.courseSlug, params.lessonSlug),
    );
  },
});

function isCourseAccessError(error: unknown) {
  return error instanceof Error && error.message === "Course access required";
}

function LessonError({ error }: ErrorComponentProps) {
  const { courseSlug } = Route.useParams();

  if (!isCourseAccessError(error)) {
    return (
      <PageShell>
        <PageHeader
          title="Lesson unavailable"
          backTo={{ to: "/courses/$courseSlug", params: { courseSlug }, label: "Back to course" }}
        />
        <Surface>
          <Text c="dimmed">
            {error instanceof Error ? error.message : "This lesson could not be loaded."}
          </Text>
        </Surface>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageHeader
        title="This lesson is included with course access"
        description="Free preview lessons can be watched without signing in. This lesson requires an account with active access to the course."
        backTo={{ to: "/courses/$courseSlug", params: { courseSlug }, label: "Back to course" }}
        meta={
          <>
            <Badge color="gray" variant="light">
              Locked
            </Badge>
            <Text c="dimmed">Course access required</Text>
          </>
        }
      />
      <Surface>
        <Group>
          <Link to="/login">
            <Button>Sign in</Button>
          </Link>
          <Link to="/courses/$courseSlug" params={{ courseSlug }}>
            <Button variant="light">View course lessons</Button>
          </Link>
        </Group>
      </Surface>
    </PageShell>
  );
}

function LessonRoute() {
  const { courseSlug, lessonSlug } = Route.useParams();
  const lesson = useQuery(lessonQueryOptions(courseSlug, lessonSlug));

  return (
    <PageShell size="full" tone="player">
      {lesson.data ? (
        <div className="pc-lesson-layout">
          <Stack gap="lg" className="pc-player-main">
            <section className="pc-player-hero">
              <PageHeader
                eyebrow="Private lesson"
                title={lesson.data.lesson.title}
                description={lesson.data.course.title}
                backTo={{
                  to: "/courses/$courseSlug",
                  params: { courseSlug },
                  label: "Back to course",
                }}
                meta={
                  lesson.data.lesson.isFree ? (
                    <Badge color="green" variant="light">
                      Free preview
                    </Badge>
                  ) : (
                    <Badge variant="light">Protected playback</Badge>
                  )
                }
              />
            </section>

            <LessonNavControls
              courseSlug={courseSlug}
              previousLesson={lesson.data.navigation.previousLesson}
              nextLesson={lesson.data.navigation.nextLesson}
            />

            <LessonPlayer
              key={lesson.data.lesson.id}
              lessonId={lesson.data.lesson.id}
              videoUid={lesson.data.lesson.videoUid}
              durationSeconds={lesson.data.lesson.durationSeconds}
              initialProgressSeconds={lesson.data.progress?.progressSeconds ?? 0}
              isCompleted={Boolean(lesson.data.progress?.completedAt)}
              onProgressSaved={() =>
                queryClient.invalidateQueries({
                  queryKey: trpc.courses.lessonBySlug.queryKey({ courseSlug, lessonSlug }),
                })
              }
            />

            <LessonNavControls
              courseSlug={courseSlug}
              previousLesson={lesson.data.navigation.previousLesson}
              nextLesson={lesson.data.navigation.nextLesson}
            />

            {lesson.data.lesson.description ? (
              <Surface padding="md" className="pc-player-notes">
                <Text className="pc-eyebrow">Lesson notes</Text>
                <Text>{lesson.data.lesson.description}</Text>
              </Surface>
            ) : null}
          </Stack>

          <LessonList courseSlug={courseSlug} lessons={lesson.data.navigation.lessons} />
        </div>
      ) : (
        <Surface>
          <Text c="dimmed">{lesson.isLoading ? "Loading lesson..." : "Lesson unavailable."}</Text>
        </Surface>
      )}
    </PageShell>
  );
}
