import { Text, Title } from "@mantine/core";
import { LockKeyhole, PlaySquare, UserCheck } from "lucide-react";

import { PLATFORM_TRUST_POINTS } from "./course-offers";

const icons = [LockKeyhole, PlaySquare, UserCheck];

export function PlatformTrust() {
  return (
    <section className="pc-marketing-section pc-trust">
      <div className="pc-trust__intro">
        <Text className="pc-eyebrow">Private learning platform</Text>
        <Title order={2}>A course library built for protected training.</Title>
        <Text c="dimmed" size="lg">
          Students sign in, access only the courses granted to them, and continue learning inside a
          focused private workspace.
        </Text>
      </div>
      <div className="pc-trust__grid">
        {PLATFORM_TRUST_POINTS.map((point, index) => {
          const Icon = icons[index] ?? UserCheck;

          return (
            <article className="pc-trust__item" key={point.title}>
              <Icon size={22} aria-hidden="true" />
              <Title order={3}>{point.title}</Title>
              <Text c="dimmed">{point.description}</Text>
            </article>
          );
        })}
      </div>
    </section>
  );
}
