import { Paper, type PaperProps } from "@mantine/core";
import type { ReactNode } from "react";

export type SurfaceVariant = "default" | "raised" | "subtle" | "accent" | "danger";
export type SurfacePadding = "sm" | "md" | "lg" | "xl";

export type SurfaceProps = PaperProps & {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
  padding?: SurfacePadding;
  variant?: SurfaceVariant;
};

const paddingMap: Record<SurfacePadding, PaperProps["p"]> = {
  sm: "sm",
  md: "md",
  lg: "lg",
  xl: "xl",
};

export function Surface({
  children,
  className,
  interactive = false,
  padding = "lg",
  variant = "default",
  ...props
}: SurfaceProps) {
  const classes = [
    "pc-surface",
    variant !== "default" ? `pc-surface--${variant}` : "",
    interactive ? "pc-surface--interactive" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Paper withBorder p={paddingMap[padding]} className={classes} {...props}>
      {children}
    </Paper>
  );
}
