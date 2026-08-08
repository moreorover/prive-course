import { Box, Button, Group, Text } from "@mantine/core";
import { Link } from "@tanstack/react-router";

import { authClient } from "@/lib/auth-client";

import { ModeToggle } from "./mode-toggle";
import UserMenu from "./user-menu";

export default function Header() {
  const { data: session } = authClient.useSession();
  const links = [
    { to: "/", label: "Studio" },
    { to: "/courses", label: "Classes" },
    ...(session?.user.role === "admin" ? [{ to: "/admin", label: "Admin" }] : []),
  ] as const;

  return (
    <Box component="header" className="pc-boutique-header">
      <div className="pc-boutique-header-inner">
        <Link to="/" className="pc-boutique-wordmark">
          <span>priauginimas.lt</span>
          <Text size="xs" c="dimmed">
            private salon classes
          </Text>
        </Link>

        <nav className="pc-boutique-nav" aria-label="Main navigation">
          {links.map(({ to, label }) => (
            <Link key={to} to={to} activeProps={{ "aria-current": "page" }}>
              <Button component="span" size="xs" variant="subtle">
                {label}
              </Button>
            </Link>
          ))}
        </nav>

        <Group gap="xs" wrap="nowrap" className="pc-boutique-actions">
          <ModeToggle />
          <UserMenu />
        </Group>
      </div>
    </Box>
  );
}
