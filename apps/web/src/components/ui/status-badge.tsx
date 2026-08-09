import { Badge, type BadgeProps } from "@mantine/core";

export type ProductStatus =
  | "published"
  | "draft"
  | "archived"
  | "free"
  | "included"
  | "locked"
  | "accessGranted"
  | "preview"
  | "admin"
  | "student";

const statusConfig: Record<
  ProductStatus,
  { color: BadgeProps["color"]; label: string; variant: BadgeProps["variant"] }
> = {
  accessGranted: { color: "green", label: "Access granted", variant: "light" },
  admin: { color: "atelier", label: "Admin", variant: "light" },
  archived: { color: "gray", label: "Archived", variant: "light" },
  draft: { color: "yellow", label: "Draft", variant: "light" },
  free: { color: "atelier", label: "Free preview", variant: "light" },
  included: { color: "green", label: "Included", variant: "light" },
  locked: { color: "gray", label: "Locked", variant: "light" },
  preview: { color: "yellow", label: "Preview available", variant: "light" },
  published: { color: "green", label: "Published", variant: "light" },
  student: { color: "gray", label: "Student", variant: "light" },
};

export function StatusBadge({ status }: { status: ProductStatus }) {
  const config = statusConfig[status];

  return (
    <Badge color={config.color} variant={config.variant}>
      {config.label}
    </Badge>
  );
}
