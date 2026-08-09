import { Button, Text, Title } from "@mantine/core";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Mail } from "lucide-react";

export function FinalCta() {
  return (
    <section className="pc-final-cta">
      <div>
        <Text className="pc-eyebrow">Product Atelier</Text>
        <Title order={2}>Technique, offers, and content in one private course system.</Title>
        <Text c="dimmed" size="lg">
          Start with the extension foundation, expand into the pro pathway, or build a stronger
          marketing strategy around the services you already provide.
        </Text>
      </div>
      <div className="pc-final-cta__actions">
        <Link to="/courses">
          <Button rightSection={<ArrowRight size={18} />}>View courses</Button>
        </Link>
        <a href="#updates">
          <Button variant="light" leftSection={<Mail size={18} />}>
            Get updates
          </Button>
        </a>
      </div>
    </section>
  );
}
