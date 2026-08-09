import { Button, PasswordInput, Stack, TextInput } from "@mantine/core";
import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import z from "zod";

import { FormSection } from "@/components/ui";
import { authClient } from "@/lib/auth-client";

import Loader from "./loader";

export default function SignUpForm({ onSwitchToSignIn }: { onSwitchToSignIn: () => void }) {
  const navigate = useNavigate({
    from: "/",
  });
  const { isPending } = authClient.useSession();

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
      name: "",
    },
    onSubmit: async ({ value }) => {
      await authClient.signUp.email(
        {
          email: value.email,
          password: value.password,
          name: value.name,
        },
        {
          onSuccess: async () => {
            const passkey = await authClient.passkey.addPasskey({
              name: "Primary passkey",
            });

            if (passkey.error) {
              toast.error(passkey.error.message || passkey.error.statusText);
            } else {
              toast.success("Passkey added");
            }

            navigate({
              to: "/courses",
            });
            toast.success("Sign up successful");
          },
          onError: (error) => {
            toast.error(error.error.message || error.error.statusText);
          },
        },
      );
    },
    validators: {
      onSubmit: z.object({
        name: z.string().min(2, "Name must be at least 2 characters"),
        email: z.email("Invalid email address"),
        password: z.string().min(8, "Password must be at least 8 characters"),
      }),
    },
  });

  if (isPending) {
    return <Loader />;
  }

  return (
    <FormSection
      title="Create account"
      description="Set up your private Product Atelier learning workspace."
    >
      <Stack gap="md">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <Stack gap="md">
            <form.Field name="name">
              {(field) => (
                <TextInput
                  label="Name"
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  error={field.state.meta.errors[0]?.message}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.currentTarget.value)}
                />
              )}
            </form.Field>

            <form.Field name="email">
              {(field) => (
                <TextInput
                  label="Email"
                  id={field.name}
                  name={field.name}
                  type="email"
                  value={field.state.value}
                  error={field.state.meta.errors[0]?.message}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.currentTarget.value)}
                />
              )}
            </form.Field>

            <form.Field name="password">
              {(field) => (
                <PasswordInput
                  label="Password"
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  error={field.state.meta.errors[0]?.message}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.currentTarget.value)}
                />
              )}
            </form.Field>

            <form.Subscribe
              selector={(state) => ({
                canSubmit: state.canSubmit,
                isSubmitting: state.isSubmitting,
              })}
            >
              {({ canSubmit, isSubmitting }) => (
                <Button type="submit" fullWidth loading={isSubmitting} disabled={!canSubmit}>
                  Sign up
                </Button>
              )}
            </form.Subscribe>
          </Stack>
        </form>

        <Button variant="subtle" onClick={onSwitchToSignIn}>
          Already have private access? Sign in
        </Button>
      </Stack>
    </FormSection>
  );
}
