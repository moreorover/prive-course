import { Badge, Button, Text, Title } from "@mantine/core";
import { Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2 } from "lucide-react";

import { COURSE_OFFERS } from "./course-offers";

export function OfferDetailBlocks() {
  return (
    <section className="pc-marketing-section">
      <div className="pc-marketing-section__header">
        <Text className="pc-eyebrow">Course details</Text>
        <Title order={2}>Three offers with different jobs.</Title>
        <Text c="dimmed" size="lg">
          Each course is built for a specific stage: foundations, full extension mastery, or
          marketing the services you want to be known for.
        </Text>
      </div>

      <div className="pc-offer-blocks">
        {COURSE_OFFERS.map((offer) => (
          <article className={`pc-offer pc-offer--${offer.emphasis}`} key={offer.id}>
            <div className="pc-offer__media" aria-hidden="true">
              <span>{offer.shortTitle}</span>
            </div>
            <div className="pc-offer__body">
              <Badge variant={offer.emphasis === "primary" ? "filled" : "light"}>
                {offer.eyebrow}
              </Badge>
              <Title order={3}>{offer.title}</Title>
              <Text c="dimmed" size="lg">
                {offer.audience}
              </Text>
              <Text>{offer.summary}</Text>
              <ul className="pc-check-list">
                {offer.includes.map((item) => (
                  <li key={item}>
                    <CheckCircle2 size={16} aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Text className="pc-offer__access">{offer.accessNote}</Text>
              <Link to="/courses">
                <Button
                  variant={offer.emphasis === "primary" ? "filled" : "light"}
                  rightSection={<ArrowRight size={18} />}
                >
                  {offer.ctaLabel}
                </Button>
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
