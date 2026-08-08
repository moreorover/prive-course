import { Button, SimpleGrid, Stack, Text, TextInput, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, AtSign, Mail, Phone } from "lucide-react";
import { toast } from "sonner";

import { EmptyState } from "@/components/empty-state";
import { CourseCard, FormSection, PageHeader, PageShell, StatusBadge } from "@/components/ui";
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
    <PageShell>
      <div className="pc-home-layout">
        <section className="pc-home-hero">
          <div className="pc-home-hero__copy">
            <Title order={1}>Private beauty courses, taught with care.</Title>
            <Text c="dimmed" size="lg" maw={620}>
              Learn protected salon techniques through focused lessons, clear previews, and
              access-managed course libraries.
            </Text>
            <div className="pc-home-hero__actions">
              <Link to="/courses">
                <Button size="md" rightSection={<ArrowRight size={18} />}>
                  View courses
                </Button>
              </Link>
              <a href="#updates">
                <Button size="md" variant="light" leftSection={<Mail size={18} />}>
                  Course updates
                </Button>
              </a>
            </div>
          </div>

          {featuredCourse ? (
            <CourseCard
              variant="featured"
              title={featuredCourse.title}
              description={featuredCourse.description}
              href="/courses/$courseSlug"
              params={{ courseSlug: featuredCourse.slug }}
              actionLabel="Open course"
              meta={<StatusBadge status="preview" />}
            />
          ) : (
            <EmptyState
              title="New classes are being prepared"
              description="Published courses will appear here when they are ready."
            />
          )}
        </section>

        <section>
          <PageHeader
            title="Available courses"
            description="A focused course library for private salon training."
          />
          {courseCards.length === 0 ? (
            <EmptyState
              title="No courses yet"
              description="The course menu will open as soon as the first class is published."
            />
          ) : (
            <div className="pc-course-grid">
              {visibleCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  title={course.title}
                  description={course.description}
                  href="/courses/$courseSlug"
                  params={{ courseSlug: course.slug }}
                  actionLabel="Open course"
                  meta={<StatusBadge status="preview" />}
                />
              ))}
            </div>
          )}
        </section>

        <section id="updates">
          <FormSection
            title="Get course updates"
            description="Leave your details for new course releases and studio updates."
          >
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
          </FormSection>
        </section>
      </div>
    </PageShell>
  );
}
