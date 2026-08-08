import { Button, Group, Stack, Text, Title } from "@mantine/core";
import { Link, type LinkProps } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

import { Surface } from "./surface";

export type CourseCardVariant = "featured" | "standard" | "compact";

export type CourseCardProps = {
  actionLabel?: string;
  description?: string | null;
  href: LinkProps["to"];
  meta?: ReactNode;
  params?: LinkProps["params"];
  title: string;
  variant?: CourseCardVariant;
};

export function CourseCard({
  actionLabel = "View course",
  description,
  href,
  meta,
  params,
  title,
  variant = "standard",
}: CourseCardProps) {
  return (
    <Surface
      interactive
      padding={variant === "compact" ? "md" : "xl"}
      className={`pc-course-card pc-course-card--${variant}`}
    >
      <Stack gap="md" h="100%">
        {meta ? <Group className="pc-course-card__meta">{meta}</Group> : null}
        <div className="pc-course-card__body">
          <Title order={variant === "featured" ? 2 : 3}>{title}</Title>
          <Text c="dimmed" lineClamp={variant === "compact" ? 2 : 4}>
            {description || "Course details will be added soon."}
          </Text>
        </div>
        <Link to={href} params={params} className="pc-course-card__action">
          <Button
            fullWidth={variant !== "compact"}
            variant={variant === "featured" ? "filled" : "light"}
            rightSection={<ArrowRight size={16} />}
          >
            {actionLabel}
          </Button>
        </Link>
      </Stack>
    </Surface>
  );
}
