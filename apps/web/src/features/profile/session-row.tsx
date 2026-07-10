import { Button, Table, Text } from "@mantine/core";

import { formatDate, type SessionListItem } from "@/features/profile/auth-profile";

export function SessionRow({
  isPending,
  onRevoke,
  session,
}: {
  isPending: boolean;
  onRevoke: (token: string) => void;
  session: SessionListItem;
}) {
  return (
    <Table.Tr>
      <Table.Td>{formatDate(session.createdAt)}</Table.Td>
      <Table.Td>{formatDate(session.expiresAt)}</Table.Td>
      <Table.Td>{session.ipAddress ?? "Unknown"}</Table.Td>
      <Table.Td>
        <Text lineClamp={1}>{session.userAgent ?? "Unknown"}</Text>
      </Table.Td>
      <Table.Td>
        <Button
          color="red"
          size="xs"
          variant="light"
          loading={isPending}
          onClick={() => onRevoke(session.token)}
        >
          Revoke
        </Button>
      </Table.Td>
    </Table.Tr>
  );
}
