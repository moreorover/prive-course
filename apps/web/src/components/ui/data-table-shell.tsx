import { Text, Title } from "@mantine/core";
import type { ReactNode } from "react";

import { Surface } from "./surface";

export type DataTableShellProps = {
  actions?: ReactNode;
  children: ReactNode;
  description?: ReactNode;
  empty?: ReactNode;
  title: ReactNode;
};

export function DataTableShell({
  actions,
  children,
  description,
  empty,
  title,
}: DataTableShellProps) {
  return (
    <Surface className="pc-table-shell">
      <div className="pc-table-shell__header">
        <div className="pc-table-shell__title">
          <Title order={2} size="h4">
            {title}
          </Title>
          {description ? <Text c="dimmed">{description}</Text> : null}
        </div>
        {actions ? <div>{actions}</div> : null}
      </div>
      {empty ?? <div className="pc-table-shell__scroll">{children}</div>}
    </Surface>
  );
}
