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
import { ArrowRight, AtSign, BookOpen, Heart, Mail, Phone, Sparkles } from "lucide-react";
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
  const featuredCourse = courses.data?.[0];
  const spotlightCourses = courseCards.slice(0, 3);
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
    <main className="pc-page pc-home">
      <Stack gap={72}>
        <section className="pc-home-hero">
          <Stack gap="xl">
            <Badge variant="light" w="fit-content" className="pc-soft-badge">
              priauginimas.lt
            </Badge>
            <Stack gap="md">
              <Title order={1} className="pc-home-title">
                Beauty courses shaped for real salon work
              </Title>
              <Text c="dimmed" size="xl" maw={680} className="pc-home-lede">
                Learn lash and beauty techniques through calm private video classes, built for women
                who want practical steps, polished results, and space to practice.
              </Text>
            </Stack>
            <Group>
              <Link to="/courses">
                <Button size="md" rightSection={<ArrowRight size={18} />}>
                  View courses
                </Button>
              </Link>
              <a href="#updates" className="no-underline">
                <Button size="md" variant="light" leftSection={<Mail size={18} />}>
                  Get updates
                </Button>
              </a>
            </Group>
          </Stack>

          <div className="pc-hero-showcase">
            <Paper withBorder p="xl" className="pc-panel pc-feature-card">
              <Stack gap="lg">
                <Group justify="space-between" align="start" gap="md">
                  <ThemeIcon variant="light" size="xl" radius="xl">
                    <Sparkles size={22} />
                  </ThemeIcon>
                  <Badge variant="light">Featured</Badge>
                </Group>

                {featuredCourse ? (
                  <Stack gap="md">
                    <div>
                      <Text size="xs" tt="uppercase" fw={800} c="dimmed">
                        Available course
                      </Text>
                      <Title order={2} size="h2" mt={6}>
                        {featuredCourse.title}
                      </Title>
                    </div>
                    <Text c="dimmed" lineClamp={4}>
                      {featuredCourse.description ||
                        "A private salon class with focused video lessons and clear practice steps."}
                    </Text>
                    <Group gap="xs">
                      <Badge leftSection={<BookOpen size={12} />} variant="light">
                        Private lessons
                      </Badge>
                      <Badge leftSection={<Heart size={12} />} variant="light">
                        Salon paced
                      </Badge>
                    </Group>
                    <Link to="/courses/$courseSlug" params={{ courseSlug: featuredCourse.slug }}>
                      <Button fullWidth rightSection={<ArrowRight size={18} />}>
                        View this course
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

            <Paper withBorder p="md" className="pc-panel pc-studio-card">
              <Group gap="sm" wrap="nowrap">
                <ThemeIcon variant="light" radius="xl">
                  <Sparkles size={22} />
                </ThemeIcon>
                <div>
                  <Text fw={800}>Studio course list</Text>
                  <Text size="sm" c="dimmed">
                    {courseCards.length || "New"} classes prepared for private access
                  </Text>
                </div>
              </Group>
            </Paper>
          </div>
        </section>

        <section className="pc-course-menu">
          <Group justify="space-between" align="end" mb="lg" gap="md">
            <div>
              <Text size="xs" tt="uppercase" fw={800} c="dimmed">
                Course menu
              </Text>
              <Title order={2}>Choose your next class</Title>
            </div>
            <Link to="/courses">
              <Button variant="subtle" rightSection={<ArrowRight size={16} />}>
                See all
              </Button>
            </Link>
          </Group>

          {courses.data?.length === 0 ? (
            <EmptyState
              title="New classes are being prepared"
              description="The course menu will open as soon as the first class is published."
            />
          ) : null}

          <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="md">
            {spotlightCourses.map((course) => (
              <Paper key={course.id} withBorder p="lg" className="pc-panel pc-course-card">
                <Stack gap="md" h="100%">
                  <Stack gap={6}>
                    <Text size="xs" tt="uppercase" fw={800} c="dimmed">
                      Video course
                    </Text>
                    <Title order={3} size="h4">
                      {course.title}
                    </Title>
                  </Stack>
                  <Text c="dimmed" size="sm" lineClamp={3} className="grow">
                    {course.description ||
                      "A private class for building salon confidence at your own pace."}
                  </Text>
                  <Link to="/courses/$courseSlug" params={{ courseSlug: course.slug }}>
                    <Button variant="light" fullWidth>
                      Open course
                    </Button>
                  </Link>
                </Stack>
              </Paper>
            ))}
          </SimpleGrid>
        </section>

        <section id="updates" className="pc-updates-section">
          <div>
            <Text size="xs" tt="uppercase" fw={800} c="dimmed">
              Course updates
            </Text>
            <Title order={2} mt={6}>
              Hear about new classes and salon promotions
            </Title>
            <Text c="dimmed" mt="sm" maw={560}>
              Leave your details to be first in line when new lessons, course dates, or special
              offers are announced.
            </Text>
          </div>

          <Paper withBorder p="xl" className="pc-panel pc-updates-form">
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
                <Button type="submit" size="md" rightSection={<Heart size={18} />}>
                  Join update list
                </Button>
              </Stack>
            </form>
          </Paper>
        </section>
      </Stack>
    </main>
  );
}
