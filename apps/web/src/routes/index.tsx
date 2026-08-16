import { Badge, Button, Group, SimpleGrid, Text, Title } from "@mantine/core";
import { Link, createFileRoute } from "@tanstack/react-router";
import { BookOpen, Scissors, Sparkles } from "lucide-react";

import { marketingCourses } from "@/features/course/marketing-courses";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

const learningOutcomes = [
  {
    description:
      "Assess density, lifestyle, color goals, and maintenance needs before choosing a method.",
    icon: BookOpen,
    title: "Consultation flow",
  },
  {
    description: "Practice sectioning, tension control, and blend strategy for comfortable wear.",
    icon: Scissors,
    title: "Clean placement",
  },
  {
    description: "Create movement, polish, and a natural fall that photographs beautifully.",
    icon: Sparkles,
    title: "Finish and styling",
  },
] as const;

function HomeComponent() {
  const featuredCourse = marketingCourses[0];

  return (
    <div className="pc-marketing-page">
      <section className="pc-hero pc-section-shell">
        <div className="pc-hero-copy">
          <Badge className="pc-eyebrow" variant="transparent">
            Premium Beauty Education
          </Badge>
          <Title className="pc-display-title" order={1}>
            Hair extension training for polished client results
          </Title>
          <Text className="pc-hero-text">
            Learn clean installs, confident consultations, and salon-ready aftercare from guided
            video courses.
          </Text>
          <Group gap="sm">
            <Link to="/courses">
              <Button className="pc-button-primary" radius="xl" size="md">
                View Courses
              </Button>
            </Link>
            <a className="pc-button-secondary" href="#featured">
              Featured Course
            </a>
          </Group>
        </div>
        <div
          aria-label="Close hair extension texture and salon lesson placeholder"
          className="pc-image-frame pc-image-frame-hero"
          role="img"
        >
          <div className="pc-lesson-chip">
            <span>Now playing</span>
            <strong>Seamless weft placement</strong>
          </div>
        </div>
      </section>

      <section className="pc-section-shell pc-section-block" aria-labelledby="learn-heading">
        <div className="pc-section-heading">
          <Title id="learn-heading" order={2}>
            Build the technique behind premium extensions
          </Title>
          <Text>
            Training is organized around the moments that matter in the chair, from hair mapping to
            client education.
          </Text>
        </div>
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
          {learningOutcomes.map((outcome, index) => {
            const Icon = outcome.icon;

            return (
              <article
                className={index === 1 ? "pc-learn-card pc-learn-card-dark" : "pc-learn-card"}
                key={outcome.title}
              >
                <div className="pc-card-number">0{index + 1}</div>
                <Icon aria-hidden size={24} strokeWidth={1.7} />
                <Title order={3}>{outcome.title}</Title>
                <Text>{outcome.description}</Text>
              </article>
            );
          })}
        </SimpleGrid>
      </section>

      <section className="pc-experience">
        <div className="pc-section-shell pc-experience-grid">
          <div
            aria-label="Salon training video lesson placeholder"
            className="pc-image-frame pc-image-frame-studio"
            role="img"
          />
          <div className="pc-experience-list">
            <Title order={2}>A course experience made for working stylists</Title>
            {[
              [
                "Video lessons",
                "Short focused modules that make techniques easy to review between appointments.",
              ],
              [
                "Practical techniques",
                "Clear demonstrations for installs, move-ups, removal, blending, and aftercare.",
              ],
              [
                "Progress tracking",
                "Return to your current lesson and keep your learning path visible.",
              ],
              [
                "Lifetime access",
                "Revisit lessons whenever your client work calls for a refresher.",
              ],
            ].map(([title, description]) => (
              <article className="pc-experience-item" key={title}>
                <Title order={3}>{title}</Title>
                <Text>{description}</Text>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        aria-labelledby="featured-heading"
        className="pc-section-shell pc-section-block"
        id="featured"
      >
        <div className="pc-featured-panel">
          <div className="pc-featured-copy">
            <Text className="pc-course-label">Featured Course</Text>
            <Title id="featured-heading" order={2}>
              {featuredCourse.title}
            </Title>
            <Text>{featuredCourse.description}</Text>
            <div className="pc-course-stats">
              <div>
                <span>Level</span>
                <strong>{featuredCourse.level}</strong>
              </div>
              <div>
                <span>Lessons</span>
                <strong>{featuredCourse.lessonCount}</strong>
              </div>
              <div>
                <span>Access</span>
                <strong>Lifetime</strong>
              </div>
            </div>
            <Link to="/courses/$courseSlug" params={{ courseSlug: featuredCourse.slug }}>
              <Button className="pc-button-primary" radius="xl">
                View Course
              </Button>
            </Link>
          </div>
          <div
            aria-label="Featured hair extensions course thumbnail placeholder"
            className="pc-image-frame pc-image-frame-course"
            role="img"
          />
        </div>
      </section>

      <section className="pc-section-shell pc-instructor" aria-labelledby="instructor-heading">
        <div aria-label="Founder portrait placeholder" className="pc-portrait-frame" role="img" />
        <div className="pc-instructor-copy">
          <Title id="instructor-heading" order={2}>
            Learn from a stylist who teaches with clarity
          </Title>
          <Text>
            Prive Course is built around professional standards, calm instruction, and techniques
            that students can bring into real salon appointments with confidence.
          </Text>
          <div className="pc-cred-row" aria-label="Instructor credibility highlights">
            <span>Salon trained</span>
            <span>Client focused</span>
            <span>Method led</span>
          </div>
        </div>
      </section>

      <section className="pc-section-shell pc-section-block" aria-labelledby="outcomes-heading">
        <Title id="outcomes-heading" order={2}>
          Student outcomes that show up in the chair
        </Title>
        <div className="pc-outcome-grid">
          {[
            [
              "Confidence",
              "Know what to do before the client sits down and while the install is in progress.",
            ],
            [
              "Technique",
              "Develop repeatable sectioning, placement, and finishing habits that reduce guesswork.",
            ],
            [
              "Client readiness",
              "Explain maintenance, expectations, and aftercare professionally.",
            ],
            [
              "Salon-quality results",
              "Blend extensions with precision so the finished look feels elevated and natural.",
            ],
          ].map(([title, description]) => (
            <article key={title}>
              <Title order={3}>{title}</Title>
              <Text>{description}</Text>
            </article>
          ))}
        </div>
      </section>

      <section className="pc-section-shell pc-section-block" aria-labelledby="faq-heading">
        <div className="pc-section-heading">
          <Title id="faq-heading" order={2}>
            Questions before you begin
          </Title>
          <Text>Simple answers for students comparing online beauty education options.</Text>
        </div>
        <div className="pc-faq-list">
          {[
            [
              "Who is Prive Course for?",
              "It is for stylists, assistants, and beauty professionals who want structured hair extension education.",
            ],
            [
              "Do I need experience with extensions?",
              "The fundamentals course starts with core concepts, while advanced courses can build on existing salon practice.",
            ],
            [
              "How long do I keep access?",
              "Courses are designed for lifetime access so you can review lessons whenever needed.",
            ],
            [
              "Does v1 include payment checkout?",
              "No. Version 1 focuses on course discovery, access management, and protected video learning.",
            ],
          ].map(([question, answer]) => (
            <details key={question}>
              <summary>{question}</summary>
              <Text>{answer}</Text>
            </details>
          ))}
        </div>
      </section>

      <section className="pc-final-cta pc-section-shell" aria-labelledby="cta-heading">
        <div>
          <Title id="cta-heading" order={2}>
            Start with the method, then make it your own
          </Title>
          <Text>
            Browse the first Prive Course lessons and choose the training path that fits your client
            work.
          </Text>
        </div>
        <Link to="/courses">
          <Button className="pc-button-light" radius="xl">
            View Courses
          </Button>
        </Link>
      </section>
    </div>
  );
}
