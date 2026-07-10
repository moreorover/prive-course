import { Button, Group, Paper, Stack, Table, Text, Title } from "@mantine/core";
import { useState } from "react";
import { toast } from "sonner";

import type { SessionListItem } from "@/features/profile/auth-profile";
import { SessionRow } from "@/features/profile/session-row";
import { authClient } from "@/lib/auth-client";

export function SessionsSection({
  data,
  onRefetch,
}: {
  data: SessionListItem[];
  onRefetch: () => Promise<unknown>;
}) {
  const [pendingToken, setPendingToken] = useState<string | null>(null);

  async function revokeSession(token: string) {
    setPendingToken(token);
    try {
      const result = await authClient.revokeSession({ token });

      if (result.error) {
        toast.error(result.error.message || result.error.statusText);
        return;
      }

      await onRefetch();
      toast.success("Session revoked");
    } finally {
      setPendingToken(null);
    }
  }

  async function revokeOtherSessions() {
    const result = await authClient.revokeOtherSessions();

    if (result.error) {
      toast.error(result.error.message || result.error.statusText);
      return;
    }

    await onRefetch();
    toast.success("Other sessions revoked");
  }

  return (
    <Paper withBorder p="md" radius="sm">
      <Stack gap="md">
        <Group justify="space-between" align="center">
          <div>
            <Title order={2} size="h4">
              Sessions
            </Title>
            <Text c="dimmed">View and revoke active sessions.</Text>
          </div>
          <Button variant="light" onClick={revokeOtherSessions}>
            Revoke other sessions
          </Button>
        </Group>
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Created</Table.Th>
              <Table.Th>Expires</Table.Th>
              <Table.Th>IP</Table.Th>
              <Table.Th>Agent</Table.Th>
              <Table.Th />
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {data.map((item) => (
              <SessionRow
                key={item.id}
                isPending={pendingToken === item.token}
                session={item}
                onRevoke={revokeSession}
              />
            ))}
          </Table.Tbody>
        </Table>
      </Stack>
    </Paper>
  );
}
