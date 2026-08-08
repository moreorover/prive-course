import { Box, Button, Group, Text } from "@mantine/core";
import { Link } from "@tanstack/react-router";
import { Command } from "lucide-react";

import { authClient } from "@/lib/auth-client";

import { ModeToggle } from "./mode-toggle";
import UserMenu from "./user-menu";

export default function Header() {
  const { data: session } = authClient.useSession();
  const links = [
    { to: "/", label: "Overview" },
    { to: "/courses", label: "Catalog" },
    ...(session?.user.role === "admin" ? [{ to: "/admin", label: "Admin" }] : []),
  ] as const;

  return (
    <Box component="header" className="pc-saas-header">
      <div className="pc-saas-header-inner">
        <Link to="/" className="pc-saas-brand">
          <span className="pc-saas-brand-mark">
            <Command size={16} />
          </span>
          <span>
            <Text fw={850} lh={1}>
              priauginimas.lt
            </Text>
            <Text size="xs" c="dimmed">
              course console
            </Text>
          </span>
        </Link>

        <nav className="pc-saas-nav" aria-label="Main navigation">
          {links.map(({ to, label }) => (
            <Link key={to} to={to} activeProps={{ "aria-current": "page" }}>
              <Button component="span" size="xs" variant="subtle">
                {label}
              </Button>
            </Link>
          ))}
        </nav>

        <Group gap="xs" wrap="nowrap" className="pc-saas-actions">
          <ModeToggle />
          <UserMenu />
        </Group>
      </div>
    </Box>
  );
}
