import { Button, Group, Stack, Text, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { Mail, UserRound } from "lucide-react";
import { toast } from "sonner";

export function SubscribeForm() {
  const form = useForm({
    initialValues: { email: "", name: "" },
    validate: {
      email: (value) =>
        /^\S+@\S+\.\S+$/.test(value.trim()) ? null : "Enter a valid email address",
    },
  });

  return (
    <form
      className="pc-subscribe-form"
      onSubmit={form.onSubmit(() => {
        toast.success("You are on the Product Atelier update list.");
        form.reset();
      })}
    >
      <Stack gap="md">
        <Group align="flex-start" grow wrap="wrap">
          <TextInput
            label="Email"
            placeholder="you@example.com"
            type="email"
            leftSection={<Mail size={16} />}
            key={form.key("email")}
            {...form.getInputProps("email")}
          />
          <TextInput
            label="Name"
            placeholder="Your name"
            leftSection={<UserRound size={16} />}
            key={form.key("name")}
            {...form.getInputProps("name")}
          />
        </Group>
        <Group justify="space-between" align="center" gap="md">
          <Text size="sm" c="dimmed">
            Course release notes, private enrollment windows, and new lesson updates.
          </Text>
          <Button type="submit">Subscribe</Button>
        </Group>
      </Stack>
    </form>
  );
}
