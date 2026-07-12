import {
  Badge,
  Button,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { BookOpen, Crown, PlayCircle } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { trpc } from "@/utils/trpc";

const publishedCoursesQueryOptions = trpc.courses.listPublished.queryOptions();

export const Route = createFileRoute("/courses/")({
  component: CoursesRoute,
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(publishedCoursesQueryOptions);
  },
});

function CoursesRoute() {
  const courses = useQuery(publishedCoursesQueryOptions);

  return (
    <main className="pc-page">
      <Stack gap={48}>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
          <Stack gap="md">
            <Badge color="gold" variant="light" w="fit-content">
              Course catalog
            </Badge>
            <Title order={1} size="3.25rem" lh={1.02}>
              Choose your next private course
            </Title>
            <Text c="dimmed" size="lg" maw={720}>
              Browse published courses, inspect the lesson outline, and start with free previews
              before signing in for full access.
            </Text>
          </Stack>
          <Paper withBorder p="lg" className="pc-panel">
            <Stack gap="sm">
              <Group gap="sm">
                <ThemeIcon color="gold" variant="light">
                  <Crown size={18} />
                </ThemeIcon>
                <Text fw={700}>Private learning catalog</Text>
              </Group>
              <Text c="dimmed" size="sm">
                Courses are curated for controlled access, protected playback, and clear preview
                paths.
              </Text>
            </Stack>
          </Paper>
        </div>

        {courses.data?.length === 0 ? (
          <EmptyState
            title="No courses yet"
            description="Courses will appear here when they are available."
          />
        ) : null}

        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
          {courses.data?.map((course) => (
            <Paper
              key={course.id}
              withBorder
              p="xl"
              className="pc-panel"
              style={{ borderTop: "3px solid var(--pc-accent)" }}
            >
              <Stack gap="lg">
                <Group justify="space-between" align="start" gap="md" wrap="nowrap">
                  <Stack gap={4}>
                    <Text size="xs" tt="uppercase" fw={800} c="dimmed">
                      Private course
                    </Text>
                    <Title order={2} size="h3">
                      {course.title}
                    </Title>
                  </Stack>
                  {course.hasActiveAccess ? (
                    <Badge color="gold" variant="filled">
                      Access granted
                    </Badge>
                  ) : null}
                </Group>
                <Text c="dimmed" lineClamp={3}>
                  {course.description || "No description yet."}
                </Text>
                <Group gap="xs">
                  <Badge leftSection={<BookOpen size={12} />} color="gray" variant="light">
                    Course details
                  </Badge>
                  <Badge leftSection={<PlayCircle size={12} />} color="gold" variant="light">
                    Free previews where available
                  </Badge>
                </Group>
                <Link to="/courses/$courseSlug" params={{ courseSlug: course.slug }}>
                  <Button
                    variant={course.hasActiveAccess ? "filled" : "light"}
                    color="gold"
                    fullWidth
                  >
                    View course
                  </Button>
                </Link>
              </Stack>
            </Paper>
          ))}
        </SimpleGrid>
      </Stack>
    </main>
  );
}
