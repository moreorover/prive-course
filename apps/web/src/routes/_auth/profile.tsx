import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { PageHeader, PageShell } from "@/components/ui";
import { AccountSection } from "@/features/profile/account-section";
import { loadSessions } from "@/features/profile/auth-profile";
import { PasskeysSection } from "@/features/profile/passkeys-section";
import { PasswordSection } from "@/features/profile/password-section";
import { SessionsSection } from "@/features/profile/sessions-section";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/_auth/profile")({
  component: ProfileRoute,
});

function ProfileRoute() {
  const session = authClient.useSession();
  const passkeys = authClient.useListPasskeys();
  const sessions = useQuery({
    queryKey: ["profile", "sessions"],
    queryFn: loadSessions,
  });

  return (
    <PageShell>
      <PageHeader
        eyebrow="Account workspace"
        title="Profile and security"
        description={
          session.data?.user.email
            ? `${session.data.user.email} controls course access, passkeys, passwords, and active sessions.`
            : "Manage your Product Atelier account security."
        }
      />
      <div className="pc-profile-stack">
        {session.data ? (
          <AccountSection session={session.data} onRefetch={session.refetch} />
        ) : null}
        <PasswordSection onSessionsChanged={sessions.refetch} />
        <PasskeysSection data={passkeys.data ?? []} onRefetch={passkeys.refetch} />
        <SessionsSection data={sessions.data ?? []} onRefetch={sessions.refetch} />
      </div>
    </PageShell>
  );
}
