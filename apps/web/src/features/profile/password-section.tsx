import { Button, Group, PasswordInput, Stack } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useState } from "react";
import { toast } from "sonner";

import { FormSection } from "@/components/ui";
import { authClient } from "@/lib/auth-client";

export function PasswordSection({
  onSessionsChanged,
}: {
  onSessionsChanged: () => Promise<unknown>;
}) {
  const [isChanging, setIsChanging] = useState(false);
  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      currentPassword: "",
      newPassword: "",
    },
    validate: {
      currentPassword: (value) =>
        value.length >= 8 ? null : "Current password must be at least 8 characters",
      newPassword: (value) =>
        value.length >= 8 ? null : "New password must be at least 8 characters",
    },
  });

  async function changePassword(value: { currentPassword: string; newPassword: string }) {
    setIsChanging(true);
    try {
      const result = await authClient.changePassword({
        currentPassword: value.currentPassword,
        newPassword: value.newPassword,
        revokeOtherSessions: true,
      });

      if (result.error) {
        toast.error(result.error.message || result.error.statusText);
        return;
      }

      form.reset();
      await onSessionsChanged();
      toast.success("Password updated");
    } finally {
      setIsChanging(false);
    }
  }

  return (
    <FormSection
      title="Password"
      description="Change your password and revoke other sessions after the update."
    >
      <form onSubmit={form.onSubmit(changePassword)}>
        <Stack gap="md">
          <PasswordInput
            label="Current password"
            key={form.key("currentPassword")}
            {...form.getInputProps("currentPassword")}
          />
          <PasswordInput
            label="New password"
            key={form.key("newPassword")}
            {...form.getInputProps("newPassword")}
          />
          <Group justify="flex-end">
            <Button type="submit" loading={isChanging}>
              Change password
            </Button>
          </Group>
        </Stack>
      </form>
    </FormSection>
  );
}
