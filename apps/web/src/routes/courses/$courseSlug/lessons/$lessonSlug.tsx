import { AppShell, Badge, Burger, Button, Text, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute, type ErrorComponentProps } from "@tanstack/react-router";
import { ArrowLeft, LockKeyhole } from "lucide-react";

import { PageShell, Surface } from "@/components/ui";
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
  const isAccessError = isCourseAccessError(error);
  const title = isAccessError ? "This lesson is part of the private track" : "Lesson unavailable";
  const description = isAccessError
    ? "Sign in with an account that has course access, or return to the course page to continue with available preview lessons."
    : error instanceof Error
      ? error.message
      : "This lesson could not be loaded.";

  return (
    <PageShell tone="player">
      <Surface padding="xl" className="pc-lesson-error">
        <Link to="/courses/$courseSlug" params={{ courseSlug }} className="pc-back-link">
          <ArrowLeft size={16} aria-hidden="true" />
          <span>Back to course</span>
        </Link>

        <div className="pc-lesson-error__panel">
          <div className="pc-lesson-error__icon">
            <LockKeyhole size={28} aria-hidden="true" />
          </div>
          <Badge color={isAccessError ? "gray" : "red"} variant="light">
            {isAccessError ? "Course access required" : "Playback unavailable"}
          </Badge>
          <Title order={1}>{title}</Title>
          <Text c="dimmed">{description}</Text>
          <div className="pc-lesson-error__actions">
            {isAccessError ? (
              <Link to="/login">
                <Button>Sign in</Button>
              </Link>
            ) : null}
            <Link to="/courses/$courseSlug" params={{ courseSlug }}>
              <Button variant={isAccessError ? "light" : "filled"}>View course lessons</Button>
            </Link>
          </div>
        </div>
      </Surface>
    </PageShell>
  );
}

function LessonRoute() {
  const { courseSlug, lessonSlug } = Route.useParams();
  const lesson = useQuery(lessonQueryOptions(courseSlug, lessonSlug));
  const [navbarOpened, { close: closeNavbar, toggle: toggleNavbar }] = useDisclosure(false);

  return (
    <PageShell size="full" tone="player">
      {lesson.data ? (
        <AppShell
          className="pc-learning-appshell"
          navbar={{
            width: 340,
            breakpoint: "md",
            collapsed: { mobile: !navbarOpened },
          }}
          padding={0}
        >
          <div className="pc-learning-mobile-toolbar">
            <Burger
              aria-label="Toggle lesson list"
              onClick={toggleNavbar}
              opened={navbarOpened}
              size="sm"
            />
            <Text fw={780}>Course lessons</Text>
            <Badge variant="light">{lesson.data.navigation.lessons.length}</Badge>
          </div>

          <AppShell.Navbar p="md" className="pc-learning-navbar">
            <LessonList
              courseSlug={courseSlug}
              lessons={lesson.data.navigation.lessons}
              onNavigate={closeNavbar}
            />
          </AppShell.Navbar>

          <AppShell.Main className="pc-learning-main">
            <section className="pc-learning-stage">
              <div className="pc-learning-rail">
                <Link to="/courses/$courseSlug" params={{ courseSlug }} className="pc-back-link">
                  <ArrowLeft size={16} aria-hidden="true" />
                  <span>Back to course</span>
                </Link>
                <div className="pc-learning-rail__content">
                  <div>
                    <Text className="pc-eyebrow">Learning workspace</Text>
                    <Title order={1}>{lesson.data.lesson.title}</Title>
                    <Text c="dimmed">{lesson.data.course.title}</Text>
                  </div>
                  <div className="pc-learning-rail__meta">
                    {lesson.data.lesson.isFree ? (
                      <Badge color="green" variant="light">
                        Free preview
                      </Badge>
                    ) : (
                      <Badge variant="light">Protected playback</Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="pc-learning-stage__panel">
                <div className="pc-learning-stage__header">
                  <div>
                    <Text className="pc-eyebrow">Lesson player</Text>
                    <Text c="dimmed" size="sm">
                      Watch inside the private Product Atelier workspace.
                    </Text>
                  </div>
                </div>

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
              </div>

              {lesson.data.lesson.description ? (
                <Surface padding="md" className="pc-learning-notes">
                  <Text className="pc-eyebrow">Lesson notes</Text>
                  <Text>{lesson.data.lesson.description}</Text>
                </Surface>
              ) : null}

              <Surface padding="md" className="pc-learning-next">
                <div>
                  <Text className="pc-eyebrow">Next step</Text>
                  <Title order={2} size="h3">
                    Continue through the course
                  </Title>
                </div>
                <LessonNavControls
                  courseSlug={courseSlug}
                  previousLesson={lesson.data.navigation.previousLesson}
                  nextLesson={lesson.data.navigation.nextLesson}
                />
              </Surface>
            </section>
          </AppShell.Main>
        </AppShell>
      ) : (
        <Surface>
          <Text c="dimmed">{lesson.isLoading ? "Loading lesson..." : "Lesson unavailable."}</Text>
        </Surface>
      )}
    </PageShell>
  );
}
