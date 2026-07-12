import { Button, Menu, Skeleton, Text } from "@mantine/core";
import { Link, useNavigate } from "@tanstack/react-router";

import { authClient } from "@/lib/auth-client";
import { queryClient, trpc } from "@/utils/trpc";

export default function UserMenu() {
  const navigate = useNavigate();
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return <Skeleton height={36} width={96} />;
  }

  if (!session) {
    return (
      <Link to="/login">
        <Button variant="outline">Sign In</Button>
      </Link>
    );
  }

  return (
    <Menu position="bottom-end" withinPortal>
      <Menu.Target>
        <Button variant="outline">{session.user.name}</Button>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>My Account</Menu.Label>
        <Menu.Item disabled>
          <Text size="sm" c="dimmed">
            {session.user.email}
          </Text>
        </Menu.Item>
        <Menu.Item onClick={() => navigate({ to: "/profile" })}>Profile</Menu.Item>
        <Menu.Item
          color="red"
          onClick={() => {
            authClient.signOut({
              fetchOptions: {
                onSuccess: async () => {
                  await queryClient.invalidateQueries({
                    queryKey: trpc.courses.listGranted.queryKey(),
                  });
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
