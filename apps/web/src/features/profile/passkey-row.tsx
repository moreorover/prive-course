import { Button, Group, Table } from "@mantine/core";

import { formatDate, type PasskeyData } from "@/features/profile/auth-profile";

export function PasskeyRow({
  passkey,
  isPending,
  onDelete,
  onRename,
}: {
  passkey: PasskeyData;
  isPending: boolean;
  onDelete: (id: string) => void;
  onRename: (id: string, currentName: string | null | undefined) => void;
}) {
  return (
    <Table.Tr>
      <Table.Td>{passkey.name ?? "Passkey"}</Table.Td>
      <Table.Td>{passkey.createdAt ? formatDate(passkey.createdAt) : "Unknown"}</Table.Td>
      <Table.Td>
        <Group justify="flex-end">
          <Button
            size="xs"
            variant="light"
            loading={isPending}
            onClick={() => onRename(passkey.id, passkey.name)}
          >
            Rename
          </Button>
          <Button
            color="red"
            size="xs"
            variant="light"
            loading={isPending}
            onClick={() => onDelete(passkey.id)}
          >
            Delete
          </Button>
        </Group>
      </Table.Td>
    </Table.Tr>
  );
}
