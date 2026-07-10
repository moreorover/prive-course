import { Stack, Text, Title } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

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
    <main className="mx-auto w-full max-w-5xl px-4 py-8">
      <Stack gap="lg">
        <div>
          <Title order={1}>Profile</Title>
          <Text c="dimmed">{session.data?.user.email}</Text>
        </div>

        {session.data ? (
          <AccountSection session={session.data} onRefetch={session.refetch} />
        ) : null}
        <PasswordSection onSessionsChanged={sessions.refetch} />
        <PasskeysSection data={passkeys.data ?? []} onRefetch={passkeys.refetch} />
        <SessionsSection data={sessions.data ?? []} onRefetch={sessions.refetch} />
      </Stack>
    </main>
  );
}
