import { Badge, Button, Group, Paper, Stack, TextInput, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useState } from "react";
import { toast } from "sonner";

import type { SessionData } from "@/features/profile/auth-profile";
import { authClient } from "@/lib/auth-client";

export function AccountSection({
  session,
  onRefetch,
}: {
  session: SessionData;
  onRefetch: () => Promise<unknown>;
}) {
  const [isUpdating, setIsUpdating] = useState(false);
  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      name: session.user.name ?? "",
    },
    validate: {
      name: (value) => (value.trim().length >= 2 ? null : "Name must be at least 2 characters"),
    },
  });

  async function updateProfile(value: { name: string }) {
    setIsUpdating(true);
    try {
      const result = await authClient.updateUser({
        name: value.name.trim(),
      });

      if (result.error) {
        toast.error(result.error.message || result.error.statusText);
        return;
      }

      await onRefetch();
      toast.success("Profile updated");
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <Paper withBorder p="md" radius="sm">
      <form onSubmit={form.onSubmit(updateProfile)}>
        <Stack gap="md">
          <Title order={2} size="h4">
            Account
          </Title>
          <TextInput label="Name" key={form.key("name")} {...form.getInputProps("name")} />
          <Group justify="space-between">
            <Badge variant="light">
              {session.user.emailVerified ? "Email verified" : "Email not verified"}
            </Badge>
            <Button type="submit" loading={isUpdating}>
              Save profile
            </Button>
          </Group>
        </Stack>
      </form>
    </Paper>
  );
}
