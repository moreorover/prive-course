import { Stack, Text, Title } from "@mantine/core";
import type { ReactNode } from "react";

import { Surface } from "@/components/ui";

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
    <Surface padding="xl">
      <Stack gap="xs" align="center" ta="center" className="pc-empty-state">
        <Title order={2} size="h4">
          {title}
        </Title>
        <Text c="dimmed" maw={520}>
          {description}
        </Text>
        {action ? <div>{action}</div> : null}
      </Stack>
    </Surface>
  );
}
