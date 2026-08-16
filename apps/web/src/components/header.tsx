import { Box, Button, Group, Text } from "@mantine/core";
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
    <Box
      component="header"
      className="pc-site-header"
      style={{
        background: "color-mix(in srgb, var(--pc-panel) 88%, transparent)",
        borderColor: "var(--pc-border)",
      }}
    >
      <div className="pc-header-inner">
        <Group className="pc-header-main" gap="lg" wrap="nowrap">
          <Link to="/" className="pc-brand">
            <span aria-hidden className="pc-brand-mark" />
            <div>
              <Text fw={900} lh={1}>
                Prive Course
              </Text>
            </div>
          </Link>
          <nav className="pc-nav">
            {links.map(({ to, label }) => {
              return (
                <Link key={to} to={to} activeProps={{ "aria-current": "page" }}>
                  <Button className="pc-nav-button" component="span" size="xs" variant="subtle">
                    {label}
                  </Button>
                </Link>
              );
            })}
          </nav>
        </Group>
        <Group className="pc-header-actions" gap="xs" wrap="nowrap">
          <ModeToggle />
          <UserMenu />
        </Group>
      </div>
    </Box>
  );
}
