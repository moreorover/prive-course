import {
  Badge,
  Button,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, AtSign, BookOpen, Mail, Phone, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { EmptyState } from "@/components/empty-state";
import { trpc } from "@/utils/trpc";

const publishedCoursesQueryOptions = trpc.courses.listPublished.queryOptions();
const academyMarks = ["Technique", "Practice", "Client-ready"] as const;

export const Route = createFileRoute("/")({
  component: HomeComponent,
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(publishedCoursesQueryOptions);
  },
});

function HomeComponent() {
  const courses = useQuery(publishedCoursesQueryOptions);
  const courseCards = courses.data ?? [];
  const featuredCourse = courseCards[0];
  const visibleCourses = courseCards.slice(0, 4);
  const form = useForm({
    initialValues: {
      email: "",
      fullName: "",
      instagram: "",
      phone: "",
    },
    validate: {
      email: (value) =>
        /^\S+@\S+\.\S+$/.test(value.trim()) ? null : "Enter a valid email address",
    },
  });

  return (
    <main className="pc-page pc-home pc-home-academy">
      <Stack gap={86}>
        <section className="pc-academy-hero">
          <Stack gap="xl" className="pc-academy-copy">
            <div className="pc-academy-kicker">
              <span>priauginimas.lt academy</span>
              <span>private course edition</span>
            </div>
            <Stack gap="md">
              <Title order={1} className="pc-academy-title">
                Precision beauty training, edited like a masterclass.
              </Title>
              <Text c="dimmed" className="pc-academy-lede">
                A curated learning space for salon techniques that need close-up instruction,
                repeated practice, and client-ready confidence.
              </Text>
            </Stack>
            <Group>
              <Link to="/courses">
                <Button size="md" rightSection={<ArrowRight size={18} />}>
                  Explore courses
                </Button>
              </Link>
              <a href="#updates" className="no-underline">
                <Button size="md" variant="outline" leftSection={<Mail size={18} />}>
                  Course updates
                </Button>
              </a>
            </Group>
            <div className="pc-academy-proof" aria-label="Academy method">
              {academyMarks.map((mark) => (
                <span key={mark}>{mark}</span>
              ))}
            </div>
          </Stack>

          <div className="pc-academy-showcase">
            <div className="pc-academy-index">
              {visibleCourses.length > 0 ? (
                visibleCourses.slice(0, 3).map((course, index) => (
                  <Link
                    key={course.id}
                    to="/courses/$courseSlug"
                    params={{ courseSlug: course.slug }}
                  >
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <strong>{course.title}</strong>
                  </Link>
                ))
              ) : (
                <span>New classes soon</span>
              )}
            </div>
            <Paper withBorder className="pc-panel pc-academy-card">
              <Stack gap="xl">
                <Group justify="space-between" align="start">
                  <ThemeIcon size="xl" radius="xl" variant="light">
                    <Sparkles size={22} />
                  </ThemeIcon>
                  <Badge variant="filled">Open for viewing</Badge>
                </Group>

                {featuredCourse ? (
                  <Stack gap="lg">
                    <div>
                      <Text size="xs" tt="uppercase" fw={800} c="dimmed">
                        Featured course
                      </Text>
                      <Title order={2} className="pc-academy-card-title">
                        {featuredCourse.title}
                      </Title>
                    </div>
                    <Text c="dimmed" lineClamp={5}>
                      {featuredCourse.description ||
                        "A focused private course designed for salon practice, careful repetition, and confident client-ready results."}
                    </Text>
                    <Link to="/courses/$courseSlug" params={{ courseSlug: featuredCourse.slug }}>
                      <Button fullWidth rightSection={<ArrowRight size={18} />}>
                        View course details
                      </Button>
                    </Link>
                  </Stack>
                ) : (
                  <EmptyState
                    title="New classes are being prepared"
                    description="Published courses will appear here when they are ready."
                  />
                )}
              </Stack>
            </Paper>
            <div className="pc-academy-mark">01</div>
          </div>
        </section>

        <section>
          <div className="pc-section-heading">
            <Text size="xs" tt="uppercase" fw={800} c="dimmed">
              Course edit
            </Text>
            <Title order={2}>A short list, carefully taught</Title>
          </div>

          {courseCards.length === 0 ? (
            <EmptyState
              title="New classes are being prepared"
              description="The course menu will open as soon as the first class is published."
            />
          ) : null}

          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
            {visibleCourses.map((course) => (
              <Paper key={course.id} withBorder p="xl" className="pc-panel pc-academy-course">
                <Stack gap="md" h="100%">
                  <Group justify="space-between" align="start">
                    <Text size="xs" tt="uppercase" fw={800} c="dimmed">
                      Private class
                    </Text>
                    <ThemeIcon variant="light" radius="xl">
                      <BookOpen size={17} />
                    </ThemeIcon>
                  </Group>
                  <Title order={3} size="h3">
                    {course.title}
                  </Title>
                  <Text c="dimmed" lineClamp={3} className="grow">
                    {course.description ||
                      "A refined video class for practicing technique at a calm, realistic pace."}
                  </Text>
                  <Link to="/courses/$courseSlug" params={{ courseSlug: course.slug }}>
                    <Button variant="light" fullWidth>
                      Open class
                    </Button>
                  </Link>
                </Stack>
              </Paper>
            ))}
          </SimpleGrid>
        </section>

        <section id="updates" className="pc-academy-updates">
          <Stack gap="sm">
            <Text size="xs" tt="uppercase" fw={800} c="dimmed">
              Private list
            </Text>
            <Title order={2}>Be first to hear when the next class opens.</Title>
            <Text c="dimmed" maw={560}>
              Leave your details for new course releases, model days, and studio offers.
            </Text>
          </Stack>

          <Paper withBorder p="xl" className="pc-panel pc-academy-form">
            <form
              onSubmit={form.onSubmit(() => {
                toast.success("Thank you, your details have been added for course updates.");
                form.reset();
              })}
            >
              <Stack gap="md">
                <TextInput
                  label="Email"
                  placeholder="you@example.com"
                  type="email"
                  leftSection={<Mail size={16} />}
                  key={form.key("email")}
                  {...form.getInputProps("email")}
                />
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                  <TextInput
                    label="Full name"
                    placeholder="Your name"
                    key={form.key("fullName")}
                    {...form.getInputProps("fullName")}
                  />
                  <TextInput
                    label="Instagram"
                    placeholder="@yourhandle"
                    leftSection={<AtSign size={16} />}
                    key={form.key("instagram")}
                    {...form.getInputProps("instagram")}
                  />
                </SimpleGrid>
                <TextInput
                  label="Phone"
                  placeholder="+370"
                  type="tel"
                  leftSection={<Phone size={16} />}
                  key={form.key("phone")}
                  {...form.getInputProps("phone")}
                />
                <Button type="submit" size="md">
                  Join the list
                </Button>
              </Stack>
            </form>
          </Paper>
        </section>
      </Stack>
    </main>
  );
}
