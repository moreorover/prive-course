import { Box, Button, Group, Text } from "@mantine/core";
import { Link } from "@tanstack/react-router";

import { authClient } from "@/lib/auth-client";

import { ModeToggle } from "./mode-toggle";
import UserMenu from "./user-menu";

export default function Header() {
  const { data: session } = authClient.useSession();
  const links = [
    { to: "/", label: "Academy" },
    { to: "/courses", label: "Courses" },
    ...(session?.user.role === "admin" ? [{ to: "/admin", label: "Admin" }] : []),
  ] as const;

  return (
    <Box component="header" className="pc-academy-header">
      <div className="pc-academy-header-inner">
        <Link to="/" className="pc-academy-brand">
          <span className="pc-academy-monogram">P</span>
          <span>
            <Text fw={850} lh={1}>
              priauginimas.lt
            </Text>
            <Text size="xs" c="dimmed">
              private beauty academy
            </Text>
          </span>
        </Link>

        <nav className="pc-academy-nav" aria-label="Main navigation">
          {links.map(({ to, label }) => (
            <Link key={to} to={to} activeProps={{ "aria-current": "page" }}>
              <Button component="span" size="xs" variant="subtle">
                {label}
              </Button>
            </Link>
          ))}
        </nav>

        <Group gap="xs" wrap="nowrap" className="pc-academy-actions">
          <ModeToggle />
          <UserMenu />
        </Group>
      </div>
    </Box>
  );
}
