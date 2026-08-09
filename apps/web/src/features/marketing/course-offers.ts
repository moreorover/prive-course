export type CourseOffer = {
  id: "extensions-basic" | "extensions-pro" | "social-strategy";
  title: string;
  shortTitle: string;
  eyebrow: string;
  summary: string;
  audience: string;
  includes: string[];
  accessNote: string;
  ctaLabel: string;
  emphasis: "standard" | "primary" | "strategy";
};

export type OutcomePoint = {
  title: string;
  description: string;
};

export type PlatformTrustPoint = {
  title: string;
  description: string;
};

export const COURSE_OFFERS: CourseOffer[] = [
  {
    id: "extensions-basic",
    title: "Hair Extensions Course - Basic",
    shortTitle: "Basic",
    eyebrow: "Foundation track",
    summary:
      "A focused starting point for stylists who want structured hair extension training before taking on more advanced services.",
    audience: "Best for stylists building extension confidence from the ground up.",
    includes: [
      "Core extension foundations",
      "Service preparation",
      "Client-ready technique basics",
    ],
    accessNote: "Buying Basic gives access to this course.",
    ctaLabel: "View Basic",
    emphasis: "standard",
  },
  {
    id: "extensions-pro",
    title: "Hair Extensions Course - Basic + Pro",
    shortTitle: "Basic + Pro",
    eyebrow: "Expanded track",
    summary:
      "The stronger extension path for learners who want the complete Basic foundation plus advanced pro-level training.",
    audience: "Best for stylists who want the full extension pathway.",
    includes: [
      "Everything in Basic",
      "Advanced extension technique",
      "Premium service positioning",
    ],
    accessNote: "Buying Basic + Pro gives access to Basic and Basic + Pro.",
    ctaLabel: "View Basic + Pro",
    emphasis: "primary",
  },
  {
    id: "social-strategy",
    title: "Social Media Marketing Strategy",
    shortTitle: "Social Strategy",
    eyebrow: "Growth track",
    summary:
      "A strategy course for turning beauty expertise into clearer content, stronger demand, and a more visible online presence.",
    audience: "Best for stylists and creators who want better marketing around their services.",
    includes: ["Content strategy", "Offer messaging", "Marketing habits for service growth"],
    accessNote: "Buying Social Media Marketing Strategy gives access to this course.",
    ctaLabel: "View Social Strategy",
    emphasis: "strategy",
  },
];

export const OUTCOME_POINTS: OutcomePoint[] = [
  {
    title: "Build service confidence",
    description:
      "Move from scattered tips to structured lessons built around client-ready execution.",
  },
  {
    title: "Package premium offers",
    description:
      "Use technique and positioning together so the service feels easier to explain and sell.",
  },
  {
    title: "Create demand online",
    description:
      "Turn salon skill into content that makes the offer visible before a client books.",
  },
];

export const PLATFORM_TRUST_POINTS: PlatformTrustPoint[] = [
  {
    title: "Private course access",
    description: "Students see only the courses granted to their account.",
  },
  {
    title: "Protected lesson playback",
    description:
      "Lessons stay inside the private learning experience instead of public file links.",
  },
  {
    title: "Focused learning library",
    description: "Granted courses, lessons, and progress live in one clean student workspace.",
  },
];
