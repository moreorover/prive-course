import { Group, Text, ThemeIcon } from "@mantine/core";
import { Link, type LinkProps } from "@tanstack/react-router";
import { Lock, PlayCircle } from "lucide-react";
import type { ReactNode } from "react";

import { StatusBadge, type ProductStatus } from "./status-badge";
import { Surface } from "./surface";

export type LessonRowProps = {
  action?: ReactNode;
  className?: string;
  href?: LinkProps["to"];
  meta?: ReactNode;
  params?: LinkProps["params"];
  position: number;
  status: ProductStatus;
  title: string;
};

export function LessonRow({
  action,
  className,
  href,
  meta,
  params,
  position,
  status,
  title,
}: LessonRowProps) {
  const canOpen = Boolean(href);
  const surfaceClassName = [
    "pc-lesson-row",
    status === "locked" ? "pc-lesson-row--locked" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
  const row = (
    <Surface interactive={canOpen} padding="md" className={surfaceClassName}>
      <span className="pc-lesson-row__position">{String(position).padStart(2, "0")}</span>
      <Group gap="md" wrap="nowrap">
        <ThemeIcon color={canOpen ? "atelier" : "gray"} variant="light">
          {canOpen ? <PlayCircle size={18} /> : <Lock size={18} />}
        </ThemeIcon>
        <div className="pc-lesson-row__content">
          <Text fw={740}>{title}</Text>
          {meta ? <Text className="pc-lesson-row__meta">{meta}</Text> : null}
        </div>
      </Group>
      {action ?? <StatusBadge status={status} />}
    </Surface>
  );

  return href ? (
    <Link to={href} params={params} className="pc-lesson-row-link">
      {row}
    </Link>
  ) : (
    <div className="pc-lesson-row-link">{row}</div>
  );
}
