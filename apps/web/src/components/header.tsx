import { AppShell, Burger, Button, Group, Text } from "@mantine/core";
import { Link } from "@tanstack/react-router";

import { authClient } from "@/lib/auth-client";

import { ModeToggle } from "./mode-toggle";
import UserMenu from "./user-menu";

type HeaderProps = {
  mobileNavOpened: boolean;
  onMobileNavClose: () => void;
  onMobileNavToggle: () => void;
};

export default function Header({
  mobileNavOpened,
  onMobileNavClose,
  onMobileNavToggle,
}: HeaderProps) {
  const { data: session } = authClient.useSession();
  const links = [
    { to: "/", label: "Home" },
    { to: "/courses", label: "Courses" },
    ...(session?.user.role === "admin" ? [{ to: "/admin", label: "Admin" }] : []),
  ] as const;

  const navLinks = links.map(({ to, label }) => (
    <Link key={to} to={to} activeProps={{ "aria-current": "page" }} onClick={onMobileNavClose}>
      <Button className="pc-nav-button" component="span" size="xs" variant="subtle">
        {label}
      </Button>
    </Link>
  ));

  return (
    <>
      <AppShell.Header className="pc-site-header">
        <Group className="pc-header-inner" h="100%" justify="space-between" px="md" wrap="nowrap">
          <Group className="pc-header-main" gap="lg" wrap="nowrap">
            <Burger
              aria-label="Toggle navigation"
              className="pc-mobile-burger"
              hiddenFrom="sm"
              onClick={onMobileNavToggle}
              opened={mobileNavOpened}
              size="sm"
            />
            <Link to="/" className="pc-brand" onClick={onMobileNavClose}>
              <span aria-hidden className="pc-brand-mark" />
              <div>
                <Text fw={900} lh={1}>
                  Prive Course
                </Text>
              </div>
            </Link>
            <nav className="pc-nav pc-nav-desktop">{navLinks}</nav>
          </Group>
          <Group className="pc-header-actions" gap="xs" wrap="nowrap">
            <ModeToggle />
            <UserMenu />
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar className="pc-mobile-navbar" p="md">
        <nav className="pc-mobile-nav">{navLinks}</nav>
      </AppShell.Navbar>
    </>
  );
}
