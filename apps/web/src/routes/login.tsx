import { Badge, Text, Title } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";
import { LockKeyhole, PlaySquare, Sparkles } from "lucide-react";
import { useState } from "react";

import { PageShell, Surface } from "@/components/ui";
import SignInForm from "@/components/sign-in-form";
import SignUpForm from "@/components/sign-up-form";

export const Route = createFileRoute("/login")({
  component: RouteComponent,
});

function RouteComponent() {
  const [showSignIn, setShowSignIn] = useState(false);

  return (
    <PageShell size="wide">
      <div className="pc-auth-layout">
        <section className="pc-auth-story">
          <Badge variant="light" leftSection={<Sparkles size={14} />}>
            Product Atelier access
          </Badge>
          <Title order={1}>Enter the private course workspace.</Title>
          <Text c="dimmed" size="lg">
            Create an account or sign in to continue into protected lessons, granted courses, and
            your personal learning library.
          </Text>
          <div className="pc-auth-story__points">
            <Surface padding="md">
              <LockKeyhole size={20} aria-hidden="true" />
              <Text fw={760}>Private course grants</Text>
              <Text c="dimmed" size="sm">
                Your account controls which Product Atelier courses appear in your library.
              </Text>
            </Surface>
            <Surface padding="md">
              <PlaySquare size={20} aria-hidden="true" />
              <Text fw={760}>Protected lessons</Text>
              <Text c="dimmed" size="sm">
                Playback stays inside the course experience with account-aware access.
              </Text>
            </Surface>
          </div>
        </section>
        <div className="pc-auth-panel">
          {showSignIn ? (
            <SignInForm onSwitchToSignUp={() => setShowSignIn(false)} />
          ) : (
            <SignUpForm onSwitchToSignIn={() => setShowSignIn(true)} />
          )}
        </div>
      </div>
    </PageShell>
  );
}
