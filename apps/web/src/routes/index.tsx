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
import { Link, createFileRoute } from "@tanstack/react-router";
import { BookOpen, LockKeyhole, PlayCircle } from "lucide-react";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

const highlights = [
  {
    description: "Explore published courses before creating an account.",
    icon: BookOpen,
    title: "Browse the catalog",
  },
  {
    description: "Open free lessons first and see whether the course fits.",
    icon: PlayCircle,
    title: "Preview lessons",
  },
  {
    description: "Protected lessons stay available only to learners with course access.",
    icon: LockKeyhole,
    title: "Continue privately",
  },
] as const;

function HomeComponent() {
  return (
    <main className="pc-page">
      <Stack gap={56}>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-center">
          <Stack gap="lg">
            <Badge color="gold" variant="light" w="fit-content">
              Private video courses
            </Badge>
            <Title order={1} size="3.75rem" lh={0.98}>
              Private courses. Clear previews. Protected lessons.
            </Title>
            <Text c="dimmed" size="xl" maw={760}>
              Prive Course helps learners browse available courses, inspect lesson outlines, and
              start with free previews before entering protected course material.
            </Text>
            <Group>
              <Link to="/courses">
                <Button color="gold" size="md" leftSection={<BookOpen size={18} />}>
                  Browse courses
                </Button>
              </Link>
              <Link to="/login">
                <Button color="gold" size="md" variant="light">
                  Sign in
                </Button>
              </Link>
            </Group>
          </Stack>

          <Paper
            withBorder
            p="xl"
            className="pc-panel"
            style={{ borderTop: "3px solid var(--pc-accent)" }}
          >
            <Stack gap="md">
              <Text size="xs" tt="uppercase" fw={800} c="dimmed">
                Course flow
              </Text>
              <Title order={2} size="h3">
                Browse, preview, continue
              </Title>
              <Text c="dimmed">
                The public pages work as the course storefront. The private lesson pages stay
                focused on playback and progress.
              </Text>
            </Stack>
          </Paper>
        </div>

        <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
          {highlights.map((highlight) => {
            const Icon = highlight.icon;

            return (
              <Paper key={highlight.title} withBorder p="lg" className="pc-panel">
                <Stack gap="sm">
                  <ThemeIcon color="gold" variant="light" size="lg">
                    <Icon size={18} />
                  </ThemeIcon>
                  <Title order={2} size="h4">
                    {highlight.title}
                  </Title>
                  <Text c="dimmed">{highlight.description}</Text>
                </Stack>
              </Paper>
            );
          })}
        </SimpleGrid>

        <Paper withBorder p="xl" className="pc-panel">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div>
              <Title order={2}>Ready to see what is available?</Title>
              <Text c="dimmed" mt="xs">
                Start with the course catalog. Each course shows its lesson outline and access
                states clearly.
              </Text>
            </div>
            <Link to="/courses">
              <Button color="gold" size="md">
                View courses
              </Button>
            </Link>
          </div>
        </Paper>
      </Stack>
    </main>
  );
}
