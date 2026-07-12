import { Avatar, Button, Menu, Skeleton, Text } from "@mantine/core";
import { Link, useNavigate } from "@tanstack/react-router";
import { LogOut, User } from "lucide-react";

import { authClient } from "@/lib/auth-client";

export default function UserMenu() {
  const navigate = useNavigate();
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return <Skeleton height={36} width={96} />;
  }

  if (!session) {
    return (
      <Link to="/login">
        <Button variant="filled">Sign in</Button>
      </Link>
    );
  }

  const initials =
    session.user.name
      ?.split(" ")
      .flatMap((part) => (part ? [part[0]] : []))
      .join("")
      .slice(0, 2)
      .toUpperCase() || "PC";

  return (
    <Menu position="bottom-end" withinPortal>
      <Menu.Target>
        <Button
          variant="outline"
          leftSection={
            <Avatar color="teal" radius="xl" size={22}>
              {initials}
            </Avatar>
          }
        >
          {session.user.name}
        </Button>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>Account</Menu.Label>
        <Menu.Item disabled>
          <Text size="sm" c="dimmed">
            {session.user.email}
          </Text>
        </Menu.Item>
        <Menu.Item leftSection={<User size={16} />} onClick={() => navigate({ to: "/profile" })}>
          Profile
        </Menu.Item>
        <Menu.Item
          color="red"
          leftSection={<LogOut size={16} />}
          onClick={() => {
            authClient.signOut({
              fetchOptions: {
                onSuccess: () => {
                  navigate({
                    to: "/",
                  });
                },
              },
            });
          }}
        >
          Sign Out
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
