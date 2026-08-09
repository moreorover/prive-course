import { Badge, Button, Text, Title } from "@mantine/core";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Check } from "lucide-react";

import { COURSE_OFFERS } from "./course-offers";

export function CourseLadder() {
  return (
    <section className="pc-marketing-section pc-ladder-section">
      <div className="pc-marketing-section__header">
        <Text className="pc-eyebrow">Course system</Text>
        <Title order={2}>Choose the path that matches the business you are building.</Title>
        <Text c="dimmed" size="lg">
          Product Atelier is organized as a small course ladder, not a crowded marketplace. Learn
          the service, expand the method, or sharpen how you market it online.
        </Text>
      </div>

      <div className="pc-ladder" aria-label="Product Atelier course ladder">
        {COURSE_OFFERS.map((offer, index) => (
          <article className={`pc-ladder__item pc-ladder__item--${offer.emphasis}`} key={offer.id}>
            <div className="pc-ladder__index">{String(index + 1).padStart(2, "0")}</div>
            <div className="pc-ladder__content">
              <Badge variant={offer.emphasis === "primary" ? "filled" : "light"}>
                {offer.eyebrow}
              </Badge>
              <Title order={3}>{offer.shortTitle}</Title>
              <Text c="dimmed">{offer.summary}</Text>
              <ul className="pc-check-list">
                {offer.includes.map((item) => (
                  <li key={item}>
                    <Check size={16} aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Text className="pc-ladder__access">{offer.accessNote}</Text>
            </div>
          </article>
        ))}
      </div>

      <div className="pc-ladder__action">
        <Link to="/courses">
          <Button rightSection={<ArrowRight size={18} />}>Browse all courses</Button>
        </Link>
      </div>
    </section>
  );
}
