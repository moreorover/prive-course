import { Badge, Button, Text, Title } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Mail, Sparkles } from "lucide-react";

import { CourseLadder } from "@/features/marketing/course-ladder";
import { COURSE_OFFERS, OUTCOME_POINTS } from "@/features/marketing/course-offers";
import { FinalCta } from "@/features/marketing/final-cta";
import { OfferDetailBlocks } from "@/features/marketing/offer-detail-blocks";
import { PlatformTrust } from "@/features/marketing/platform-trust";
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
        <div className="pc-home-layout">
          <section className="pc-home-hero">
            <div className="pc-home-hero__copy">
              <Badge variant="light" size="lg" leftSection={<Sparkles size={15} />}>
                Private beauty business courses
              </Badge>
              <Title order={1}>Build sharper beauty services.</Title>
              <Text c="dimmed" size="xl" maw={680}>
                Product Atelier brings hair extension technique and social media strategy into one
                private learning system for stylists ready to raise the quality, value, and
                visibility of their work.
              </Text>
              <div className="pc-home-hero__actions">
                <Link to="/courses">
                  <Button size="md" rightSection={<ArrowRight size={18} />}>
                    View courses
                  </Button>
                </Link>
                <a href="#updates">
                  <Button size="md" variant="light" leftSection={<Mail size={18} />}>
                    Get updates
                  </Button>
                </a>
              </div>
            </div>

            <aside className="pc-home-hero__panel" aria-label="Product Atelier course paths">
              <div className="pc-home-hero__panel-header">
                <div>
                  <Text className="pc-eyebrow">Three-course system</Text>
                  <Title order={2}>Technique first. Strategy next.</Title>
                </div>
                <Badge variant="outline">{publishedCourseCount || 3} courses</Badge>
              </div>

              <div className="pc-home-hero__mini-ladder">
                {COURSE_OFFERS.map((offer, index) => (
                  <article
                    className={`pc-home-hero__mini-course pc-home-hero__mini-course--${offer.emphasis}`}
                    key={offer.id}
                  >
                    <span className="pc-home-hero__mini-index">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <Text fw={800}>{offer.shortTitle}</Text>
                      <Text data-dimmed size="sm">
                        {offer.accessNote}
                      </Text>
                    </div>
                  </article>
                ))}
              </div>
            </aside>
          </section>

          <CourseLadder />

          <section className="pc-marketing-section pc-outcomes">
            <div className="pc-marketing-section__header">
              <Text className="pc-eyebrow">What this helps you change</Text>
              <Title order={2}>Skill is only useful when it becomes a clear offer.</Title>
              <Text c="dimmed" size="lg">
                These courses are structured around practical progress: better services, stronger
                client confidence, and content that makes your work easier to find.
              </Text>
            </div>
            <div className="pc-outcomes__list">
              {OUTCOME_POINTS.map((point) => (
                <article className="pc-outcome" key={point.title}>
                  <Title order={3}>{point.title}</Title>
                  <Text c="dimmed">{point.description}</Text>
                </article>
              ))}
            </div>
          </section>

          <OfferDetailBlocks />

          <section className="pc-subscribe" id="updates">
            <div>
              <Text className="pc-eyebrow">Stay close to new releases</Text>
              <Title order={2}>Get course updates before the next enrollment window.</Title>
              <Text c="dimmed" size="lg">
                Join the Product Atelier update list for course release notes, private access
                windows, and new lesson announcements.
              </Text>
            </div>
            <SubscribeForm />
          </section>

          <PlatformTrust />
          <FinalCta />
        </div>
      </div>
    </main>
  );
}
