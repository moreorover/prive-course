import { Button, Group, Paper, Stack, Table, Text, Title } from "@mantine/core";
import { useState } from "react";
import { toast } from "sonner";

import { addPasskey, type PasskeyData } from "@/features/profile/auth-profile";
import { PasskeyRow } from "@/features/profile/passkey-row";
import { authClient } from "@/lib/auth-client";

export function PasskeysSection({
  data,
  onRefetch,
}: {
  data: PasskeyData[];
  onRefetch: () => Promise<unknown>;
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function createPasskey() {
    setIsAdding(true);
    try {
      const created = await addPasskey();
      if (created) {
        await onRefetch();
      }
    } finally {
      setIsAdding(false);
    }
  }

  async function renamePasskey(id: string, currentName: string | null | undefined) {
    const nextName = window.prompt("Passkey name", currentName ?? "Passkey");
    if (!nextName?.trim()) {
      return;
    }

    setPendingId(id);
    try {
      const result = await authClient.passkey.updatePasskey({
        id,
        name: nextName.trim(),
      });

      if (result.error) {
        toast.error(result.error.message || result.error.statusText);
        return;
      }

      await onRefetch();
      toast.success("Passkey renamed");
    } finally {
      setPendingId(null);
    }
  }

  async function deletePasskey(id: string) {
    setPendingId(id);
    try {
      const result = await authClient.passkey.deletePasskey({ id });

      if (result.error) {
        toast.error(result.error.message || result.error.statusText);
        return;
      }

      await onRefetch();
      toast.success("Passkey deleted");
    } finally {
      setPendingId(null);
    }
  }

  return (
    <Paper withBorder p="md" radius="sm">
      <Stack gap="md">
        <Group justify="space-between" align="center">
          <div>
            <Title order={2} size="h4">
              Passkeys
            </Title>
            <Text c="dimmed">Manage passkeys for this account.</Text>
          </div>
          <Button loading={isAdding} onClick={createPasskey}>
            Add passkey
          </Button>
        </Group>
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Name</Table.Th>
              <Table.Th>Created</Table.Th>
              <Table.Th />
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {data.map((passkey) => (
              <PasskeyRow
                key={passkey.id}
                passkey={passkey}
                isPending={pendingId === passkey.id}
                onDelete={deletePasskey}
                onRename={renamePasskey}
              />
            ))}
            {data.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={3}>
                  <Text c="dimmed">No passkeys registered.</Text>
                </Table.Td>
              </Table.Tr>
            ) : null}
          </Table.Tbody>
        </Table>
      </Stack>
    </Paper>
  );
}
