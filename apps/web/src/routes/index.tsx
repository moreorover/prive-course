import { Badge, Button, Text, Title } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Mail } from "lucide-react";

import { COURSE_OFFERS, OUTCOME_POINTS } from "@/features/marketing/course-offers";
import { SubscribeForm } from "@/features/marketing/subscribe-form";
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
  const publishedCourseCount = courses.data?.length ?? 0;

  return (
    <main className="pc-home-page">
      <div className="pc-page-shell pc-page-shell--wide">
        <div className="pc-creator-site">
          <section className="pc-creator-hero">
            <div className="pc-creator-hero__portrait" aria-hidden="true">
              <span>Product Atelier</span>
            </div>
            <div className="pc-creator-hero__copy">
              <Badge variant="light" size="lg">
                Private course library
              </Badge>
              <Title order={1}>Learn beauty services from a focused course library.</Title>
              <Text c="dimmed" size="xl">
                Product Atelier teaches hair extension technique and social media strategy through
                private video courses built for beauty professionals who want clear, practical
                progress.
              </Text>
              <div className="pc-creator-actions">
                <Link to="/courses">
                  <Button size="md" rightSection={<ArrowRight size={18} />}>
                    Browse courses
                  </Button>
                </Link>
                <a href="#updates">
                  <Button size="md" variant="subtle" leftSection={<Mail size={18} />}>
                    Subscribe for updates
                  </Button>
                </a>
              </div>
            </div>
          </section>

          <section className="pc-creator-section">
            <div className="pc-creator-section__header">
              <Text className="pc-eyebrow">Courses</Text>
              <Title order={2}>Three ways to build the next layer of your work.</Title>
              <Text c="dimmed">
                Start with the extension foundation, take the full pro path, or focus on the content
                strategy that helps people understand what you offer.
              </Text>
            </div>
            <div className="pc-course-preview-list">
              {COURSE_OFFERS.map((offer, index) => (
                <article className="pc-course-preview" key={offer.id}>
                  <div className="pc-course-preview__media">
                    <span>{String(index + 1).padStart(2, "0")}</span>
                  </div>
                  <div className="pc-course-preview__content">
                    <Badge variant={offer.emphasis === "primary" ? "filled" : "light"}>
                      {offer.eyebrow}
                    </Badge>
                    <Title order={3}>{offer.title}</Title>
                    <Text c="dimmed">{offer.summary}</Text>
                    <Text className="pc-course-preview__access">{offer.accessNote}</Text>
                  </div>
                </article>
              ))}
            </div>
            <div className="pc-creator-footnote">
              <Text c="dimmed">{publishedCourseCount || 3} course paths are planned for v1.</Text>
              <Link to="/courses">
                <Button variant="light" rightSection={<ArrowRight size={16} />}>
                  Open course catalog
                </Button>
              </Link>
            </div>
          </section>

          <section className="pc-creator-section pc-teacher-note">
            <div>
              <Text className="pc-eyebrow">About the teacher</Text>
              <Title order={2}>
                A direct learning space for technique, service confidence, and demand.
              </Title>
            </div>
            <div className="pc-teacher-note__body">
              <Text c="dimmed" size="lg">
                The site is intentionally small: teacher introduction, course paths, private
                lessons, and updates. No blog, no marketplace, no generic platform funnel.
              </Text>
              <div className="pc-outcome-lines">
                {OUTCOME_POINTS.map((point) => (
                  <article key={point.title}>
                    <Title order={3}>{point.title}</Title>
                    <Text c="dimmed">{point.description}</Text>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className="pc-subscribe pc-subscribe--creator" id="updates">
            <div>
              <Text className="pc-eyebrow">Stay close to new releases</Text>
              <Title order={2}>Subscribe for course updates.</Title>
              <Text c="dimmed" size="lg">
                Get release notes, access-window updates, and new lesson announcements.
              </Text>
            </div>
            <SubscribeForm />
          </section>
        </div>
      </div>
    </main>
  );
}
