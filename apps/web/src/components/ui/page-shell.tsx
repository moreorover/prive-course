import type { ReactNode } from "react";

type PageShellSize = "narrow" | "default" | "wide" | "full";
type PageShellTone = "default" | "quiet" | "player";

export type PageShellProps = {
  children: ReactNode;
  size?: PageShellSize;
  tone?: PageShellTone;
};

export function PageShell({ children, size = "default", tone = "default" }: PageShellProps) {
  const classes = [
    "pc-page-shell",
    size !== "default" ? `pc-page-shell--${size}` : "",
    tone !== "default" ? `pc-page-shell--${tone}` : "",
  ]
    .filter(Boolean)
    .join(" ");

  return <main className={classes}>{children}</main>;
}
