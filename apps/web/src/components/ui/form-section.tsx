import { Text, Title } from "@mantine/core";
import type { ReactNode } from "react";

import { Surface } from "./surface";

export type FormSectionProps = {
  actions?: ReactNode;
  children: ReactNode;
  description?: ReactNode;
  title: ReactNode;
};

export function FormSection({ actions, children, description, title }: FormSectionProps) {
  return (
    <Surface className="pc-form-section" variant="raised">
      <div className="pc-form-section__header">
        <Title order={1} size="h3">
          {title}
        </Title>
        {description ? <Text c="dimmed">{description}</Text> : null}
      </div>
      {children}
      {actions ? <div>{actions}</div> : null}
    </Surface>
  );
}
