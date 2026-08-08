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
    <main className="pc-page pc-home pc-home-boutique">
      <Stack gap={76}>
        <section className="pc-boutique-hero">
          <div className="pc-boutique-intro">
            <Badge variant="light" w="fit-content">
              priauginimas.lt
            </Badge>
            <Title order={1} className="pc-boutique-title">
              Learn beauty work from a salon, not a template.
            </Title>
            <Text c="dimmed" className="pc-boutique-lede">
              Private video classes for lash and beauty services, made for women who want a calm,
              practical way to learn before practicing on real clients.
            </Text>
            <Group>
              <Link to="/courses">
                <Button size="md" rightSection={<ArrowRight size={18} />}>
                  View classes
                </Button>
              </Link>
              <a href="#updates" className="no-underline">
                <Button size="md" variant="light" leftSection={<Mail size={18} />}>
                  Leave details
                </Button>
              </a>
            </Group>
          </div>

          <Paper withBorder className="pc-panel pc-boutique-note">
            <Stack gap="lg">
              <Group gap="sm">
                <ThemeIcon variant="light" radius="xl">
                  <Sparkles size={18} />
                </ThemeIcon>
                <Text fw={800}>Studio note</Text>
              </Group>
              <Title order={2} size="h2">
                Courses are released in small, practical sets.
              </Title>
              <Text c="dimmed">
                Each class is meant to be watched, paused, repeated, and brought back to your own
                table until the movement feels natural.
              </Text>
              {featuredCourse ? (
                <Link to="/courses/$courseSlug" params={{ courseSlug: featuredCourse.slug }}>
                  <Button fullWidth rightSection={<ArrowRight size={18} />}>
                    Start with {featuredCourse.title}
                  </Button>
                </Link>
              ) : null}
            </Stack>
          </Paper>
        </section>

        <section>
          <Group justify="space-between" align="end" mb="lg">
            <div>
              <Text size="xs" tt="uppercase" fw={800} c="dimmed">
                Class menu
              </Text>
              <Title order={2}>Available salon classes</Title>
            </div>
            <Link to="/courses">
              <Button variant="subtle" rightSection={<ArrowRight size={16} />}>
                See all
              </Button>
            </Link>
          </Group>

          {courseCards.length === 0 ? (
            <EmptyState
              title="New classes are being prepared"
              description="The class menu will open as soon as the first course is published."
            />
          ) : null}

          <div className="pc-boutique-menu">
            {visibleCourses.map((course) => (
              <Paper key={course.id} withBorder p="lg" className="pc-panel pc-boutique-course">
                <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
                  <Stack gap={6} className="md:col-span-2">
                    <Text size="xs" tt="uppercase" fw={800} c="dimmed">
                      Video class
                    </Text>
                    <Title order={3} size="h3">
                      {course.title}
                    </Title>
                    <Text c="dimmed" lineClamp={2}>
                      {course.description ||
                        "A private salon lesson for learning technique with patient repetition."}
                    </Text>
                  </Stack>
                  <Stack justify="space-between" align="stretch">
                    <Badge variant="light" leftSection={<BookOpen size={12} />} w="fit-content">
                      Private access
                    </Badge>
                    <Link to="/courses/$courseSlug" params={{ courseSlug: course.slug }}>
                      <Button variant="light" fullWidth>
                        Open class
                      </Button>
                    </Link>
                  </Stack>
                </SimpleGrid>
              </Paper>
            ))}
          </div>
        </section>

        <section id="updates" className="pc-boutique-updates">
          <Stack gap="sm">
            <Text size="xs" tt="uppercase" fw={800} c="dimmed">
              First look
            </Text>
            <Title order={2}>Leave your details for new class releases.</Title>
            <Text c="dimmed" maw={560}>
              Get updates about new courses, model days, and promotional offers from the studio.
            </Text>
          </Stack>

          <Paper withBorder p="xl" className="pc-panel pc-boutique-form">
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
                  Join studio updates
                </Button>
              </Stack>
            </form>
          </Paper>
        </section>
      </Stack>
    </main>
  );
}
