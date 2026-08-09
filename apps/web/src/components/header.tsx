import { Group, Text } from "@mantine/core";
import { Link } from "@tanstack/react-router";

import { authClient } from "@/lib/auth-client";

import { ModeToggle } from "./mode-toggle";
import UserMenu from "./user-menu";

export default function Header() {
  const { data: session } = authClient.useSession();
  const links = [
    { to: "/", label: "Home" },
    { to: "/courses", label: "Courses" },
    ...(session?.user.role === "admin" ? [{ to: "/admin", label: "Admin" }] : []),
  ] as const;

  return (
    <header className="pc-header">
      <div className="pc-header__inner">
        <Link to="/" className="pc-brand">
          <span className="pc-brand__mark">P</span>
          <span className="pc-brand__text">
            <Text fw={850} lh={1}>
              Product Atelier
            </Text>
            <Text size="xs" c="dimmed">
              Technique and strategy courses
            </Text>
          </span>
        </Link>

        <nav className="pc-nav" aria-label="Main navigation">
          {links.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className="pc-nav__link"
              activeProps={{ "aria-current": "page" }}
            >
              {label}
            </Link>
          ))}
        </nav>

        <Group gap="xs" wrap="nowrap" className="pc-actions">
          <ModeToggle />
          <UserMenu />
        </Group>
      </div>
    </header>
  );
}
