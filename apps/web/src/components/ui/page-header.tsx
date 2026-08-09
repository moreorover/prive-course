import { Button, Group, Stack, Text, Title } from "@mantine/core";
import { Link, type LinkProps } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

type BackLink = {
  label?: string;
  params?: LinkProps["params"];
  to: LinkProps["to"];
};

export type PageHeaderProps = {
  actions?: ReactNode;
  backTo?: BackLink;
  description?: ReactNode;
  eyebrow?: string;
  meta?: ReactNode;
  title: ReactNode;
};

export function PageHeader({
  actions,
  backTo,
  description,
  eyebrow,
  meta,
  title,
}: PageHeaderProps) {
  return (
    <header className="pc-page-header">
      <div className="pc-page-header__top">
        <Stack gap="xs">
          {backTo ? (
            <Link to={backTo.to} params={backTo.params}>
              <Button variant="subtle" leftSection={<ArrowLeft size={16} />}>
                {backTo.label ?? "Back"}
              </Button>
            </Link>
          ) : null}
          <div className="pc-page-header__content">
            {eyebrow ? <Text className="pc-page-header__eyebrow">{eyebrow}</Text> : null}
            <Title order={1}>{title}</Title>
            {description ? <Text c="dimmed">{description}</Text> : null}
            {meta ? <Group className="pc-page-header__meta">{meta}</Group> : null}
          </div>
        </Stack>
        {actions ? <div className="pc-page-header__actions">{actions}</div> : null}
      </div>
    </header>
  );
}
