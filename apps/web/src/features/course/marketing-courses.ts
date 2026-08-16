export type MarketingCourse = {
  description: string;
  duration: string;
  imageClass: string;
  isComingSoon?: boolean;
  lessonCount: number;
  level: string;
  lessons: Array<{
    description: string;
    duration: string;
    title: string;
  }>;
  slug: string;
  title: string;
};

export const marketingCourses = [
  {
    description:
      "Build a clear foundation in consultations, sectioning, placement, blending, maintenance, and finishing.",
    duration: "6 hours",
    imageClass: "pc-thumb-fundamentals",
    lessonCount: 36,
    level: "Beginner",
    lessons: [
      {
        description: "Understand client goals, natural hair density, and method fit.",
        duration: "12 min",
        title: "Consultation foundations",
      },
      {
        description: "Create clean sections that support comfort, tension control, and blend.",
        duration: "18 min",
        title: "Sectioning and placement map",
      },
      {
        description: "Finish extensions with polish, movement, and natural shape.",
        duration: "16 min",
        title: "Blend and styling finish",
      },
    ],
    slug: "hair-extensions-fundamentals",
    title: "Hair Extensions Fundamentals",
  },
  {
    description:
      "Refine mapping, clean paneling, comfortable placement, move-ups, removal, and natural blend strategy.",
    duration: "4.5 hours",
    imageClass: "pc-thumb-tape",
    lessonCount: 28,
    level: "Intermediate",
    lessons: [
      {
        description: "Map tape placement around parting, density, and daily styling habits.",
        duration: "14 min",
        title: "Tape-in mapping strategy",
      },
      {
        description: "Control paneling and placement for comfortable, discreet installs.",
        duration: "21 min",
        title: "Clean application workflow",
      },
      {
        description: "Review removal, reapplication, and maintenance timing.",
        duration: "17 min",
        title: "Move-ups and removal",
      },
    ],
    slug: "tape-in-extensions-masterclass",
    title: "Tape-In Extensions Masterclass",
  },
  {
    description:
      "Guide clients through expectations, home care, maintenance timing, and long-term extension health.",
    duration: "3 hours",
    imageClass: "pc-thumb-aftercare",
    isComingSoon: true,
    lessonCount: 18,
    level: "All levels",
    lessons: [
      {
        description: "Set expectations for upkeep, comfort, styling, and maintenance visits.",
        duration: "11 min",
        title: "Client expectation setting",
      },
      {
        description: "Teach at-home care routines that protect the install and natural hair.",
        duration: "13 min",
        title: "Aftercare education",
      },
      {
        description: "Create a maintenance cadence that supports better long-term results.",
        duration: "10 min",
        title: "Maintenance planning",
      },
    ],
    slug: "client-consultation-and-aftercare",
    title: "Client Consultation and Aftercare",
  },
] satisfies MarketingCourse[];

export function getMarketingCourse(slug: string) {
  return marketingCourses.find((course) => course.slug === slug);
}
