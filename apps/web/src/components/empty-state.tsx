import { Stack, Text, Title } from "@mantine/core";
import type { ReactNode } from "react";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <Stack gap="xs" align="center" p="lg" ta="center">
      <Title order={2} size="h4">
        {title}
      </Title>
      <Text c="dimmed" maw={520}>
        {description}
      </Text>
      {action ? <div className="mt-2">{action}</div> : null}
    </Stack>
  );
}
