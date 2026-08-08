import {
  Badge,
  Button,
  Group,
  Paper,
  Progress,
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
import { ArrowRight, AtSign, BookOpen, Mail, Phone, PlayCircle, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { EmptyState } from "@/components/empty-state";
import { trpc } from "@/utils/trpc";

const publishedCoursesQueryOptions = trpc.courses.listPublished.queryOptions();
const workflowSteps = ["Browse", "Preview", "Request access"] as const;

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
  const visibleCourses = courseCards.slice(0, 3);
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
    <main className="pc-page pc-home pc-home-saas">
      <Stack gap={72}>
        <section className="pc-saas-hero">
          <Stack gap="xl">
            <Badge variant="light" w="fit-content">
              Launch-ready course catalog
            </Badge>
            <Stack gap="md">
              <Title order={1} className="pc-saas-title">
                A polished course hub for a modern beauty studio.
              </Title>
              <Text c="dimmed" className="pc-saas-lede">
                Turn studio knowledge into a clean public catalog: course previews, private access,
                and update capture wrapped in one focused experience.
              </Text>
            </Stack>
            <Group>
              <Link to="/courses">
                <Button size="md" rightSection={<ArrowRight size={18} />}>
                  Browse catalog
                </Button>
              </Link>
              <a href="#updates" className="no-underline">
                <Button size="md" variant="light" leftSection={<Mail size={18} />}>
                  Join updates
                </Button>
              </a>
            </Group>
            <div className="pc-saas-flow" aria-label="Course journey">
              {workflowSteps.map((step) => (
                <span key={step}>{step}</span>
              ))}
            </div>
          </Stack>

          <Paper withBorder className="pc-panel pc-dashboard" aria-label="Course dashboard preview">
            <Stack gap="lg">
              <div className="pc-dashboard-topbar">
                <Group gap="xs">
                  <span />
                  <span />
                  <span />
                </Group>
                <Text size="xs" c="dimmed">
                  course-console.priauginimas.lt
                </Text>
              </div>

              <div className="pc-dashboard-grid">
                <div className="pc-dashboard-rail">
                  <Text size="xs" tt="uppercase" fw={800} c="dimmed">
                    Console
                  </Text>
                  <Stack gap="xs">
                    <span aria-current="true">Catalog</span>
                    <span>Updates</span>
                    <span>Access</span>
                  </Stack>
                </div>

                <Stack gap="md">
                  <Group justify="space-between" align="start">
                    <div>
                      <Text size="xs" tt="uppercase" fw={800} c="dimmed">
                        Course workspace
                      </Text>
                      <Title order={2} size="h3" mt={4}>
                        Today at priauginimas.lt
                      </Title>
                    </div>
                    <ThemeIcon variant="light" radius="xl">
                      <Sparkles size={20} />
                    </ThemeIcon>
                  </Group>

                  <SimpleGrid cols={3} spacing="sm">
                    <Paper withBorder p="sm" className="pc-dashboard-stat">
                      <Text fw={900} size="xl">
                        {courseCards.length}
                      </Text>
                      <Text size="xs" c="dimmed">
                        available
                      </Text>
                    </Paper>
                    <Paper withBorder p="sm" className="pc-dashboard-stat">
                      <Text fw={900} size="xl">
                        24/7
                      </Text>
                      <Text size="xs" c="dimmed">
                        video access
                      </Text>
                    </Paper>
                    <Paper withBorder p="sm" className="pc-dashboard-stat">
                      <Text fw={900} size="xl">
                        1:1
                      </Text>
                      <Text size="xs" c="dimmed">
                        studio style
                      </Text>
                    </Paper>
                  </SimpleGrid>

                  {featuredCourse ? (
                    <Paper withBorder p="lg" className="pc-dashboard-feature">
                      <Stack gap="md">
                        <Group justify="space-between" gap="md">
                          <Badge variant="filled">Featured course</Badge>
                          <Text size="xs" c="dimmed">
                            preview ready
                          </Text>
                        </Group>
                        <Title order={3}>{featuredCourse.title}</Title>
                        <Text c="dimmed" size="sm" lineClamp={3}>
                          {featuredCourse.description ||
                            "A private beauty course with clear lesson flow and focused practice."}
                        </Text>
                        <Progress value={68} aria-label="Course preview progress" />
                        <Link
                          to="/courses/$courseSlug"
                          params={{ courseSlug: featuredCourse.slug }}
                        >
                          <Button fullWidth rightSection={<ArrowRight size={18} />}>
                            Open course
                          </Button>
                        </Link>
                      </Stack>
                    </Paper>
                  ) : (
                    <EmptyState
                      title="New classes are being prepared"
                      description="Published courses will appear here when they are ready."
                    />
                  )}
                </Stack>
              </div>
            </Stack>
          </Paper>
        </section>

        <section>
          <Group justify="space-between" align="end" mb="lg">
            <div>
              <Text size="xs" tt="uppercase" fw={800} c="dimmed">
                Catalog
              </Text>
              <Title order={2}>Course cards built for fast scanning</Title>
            </div>
            <Link to="/courses">
              <Button variant="subtle" rightSection={<ArrowRight size={16} />}>
                View all
              </Button>
            </Link>
          </Group>

          {courseCards.length === 0 ? (
            <EmptyState
              title="New classes are being prepared"
              description="The course catalog will open as soon as the first class is published."
            />
          ) : null}

          <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
            {visibleCourses.map((course) => (
              <Paper key={course.id} withBorder p="lg" className="pc-panel pc-saas-course">
                <Stack gap="md" h="100%">
                  <Group justify="space-between">
                    <ThemeIcon variant="light" radius="xl">
                      <PlayCircle size={18} />
                    </ThemeIcon>
                    <Badge variant="light">Course</Badge>
                  </Group>
                  <Title order={3} size="h4">
                    {course.title}
                  </Title>
                  <Text c="dimmed" size="sm" lineClamp={3} className="grow">
                    {course.description ||
                      "A structured class for learning beauty services with private video lessons."}
                  </Text>
                  <Link to="/courses/$courseSlug" params={{ courseSlug: course.slug }}>
                    <Button variant="light" fullWidth leftSection={<BookOpen size={16} />}>
                      Details
                    </Button>
                  </Link>
                </Stack>
              </Paper>
            ))}
          </SimpleGrid>
        </section>

        <section id="updates" className="pc-saas-updates">
          <Stack gap="sm">
            <Badge variant="light" w="fit-content">
              Updates
            </Badge>
            <Title order={2}>Get notified when new courses or promos launch.</Title>
            <Text c="dimmed">
              Share the details you prefer. The course list stays small, curated, and easy to
              follow.
            </Text>
          </Stack>

          <Paper withBorder p="xl" className="pc-panel pc-saas-form">
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
