import { Box, Button, Group, Text } from "@mantine/core";
import { Link } from "@tanstack/react-router";

import { authClient } from "@/lib/auth-client";

import { ModeToggle } from "./mode-toggle";
import UserMenu from "./user-menu";

export default function Header() {
  const { data: session } = authClient.useSession();
  const links = [
    { to: "/", label: "Home" },
    { to: "/dashboard", label: "Dashboard" },
    { to: "/courses", label: "Courses" },
    ...(session?.user.role === "admin" ? [{ to: "/admin", label: "Admin" }] : []),
  ] as const;

  return (
    <Box
      component="header"
      className="border-b"
      style={{
        background: "color-mix(in srgb, var(--pc-panel) 88%, transparent)",
        borderColor: "var(--pc-border)",
        backdropFilter: "blur(8px)",
      }}
    >
      <div
        className="mx-auto flex flex-col gap-3 px-2 py-3 sm:flex-row sm:items-center sm:justify-between"
        style={{ width: "min(100% - 1rem, 72rem)" }}
      >
        <Group gap="lg" wrap="nowrap">
          <Link to="/" className="no-underline">
            <div>
              <Text fw={800} lh={1}>
                Prive Course
              </Text>
              <Text size="xs" c="dimmed">
                Private video learning
              </Text>
            </div>
          </Link>
          <nav className="flex flex-wrap gap-2 text-sm">
            {links.map(({ to, label }) => {
              return (
                <Link key={to} to={to} activeProps={{ "aria-current": "page" }}>
                  <Button component="span" size="xs" variant="subtle">
                    {label}
                  </Button>
                </Link>
              );
            })}
          </nav>
        </Group>
        <Group gap="xs" wrap="nowrap">
          <ModeToggle />
          <UserMenu />
        </Group>
      </div>
    </Box>
  );
}
