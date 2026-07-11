import { Button, PasswordInput, Stack, TextInput, Title } from "@mantine/core";
import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import z from "zod";

import { authClient } from "@/lib/auth-client";

import Loader from "./loader";

export default function SignInForm({ onSwitchToSignUp }: { onSwitchToSignUp: () => void }) {
  const navigate = useNavigate({
    from: "/",
  });
  const [isPasskeyPending, setIsPasskeyPending] = useState(false);
  const { isPending } = authClient.useSession();

  async function signInWithPasskey() {
    setIsPasskeyPending(true);
    try {
      const result = await authClient.signIn.passkey();

      if (result.error) {
        toast.error(result.error.message || result.error.statusText);
        return;
      }

      navigate({
        to: "/dashboard",
      });
      toast.success("Sign in successful");
    } finally {
      setIsPasskeyPending(false);
    }
  }

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      await authClient.signIn.email(
        {
          email: value.email,
          password: value.password,
        },
        {
          onSuccess: () => {
            navigate({
              to: "/dashboard",
            });
            toast.success("Sign in successful");
          },
          onError: (error) => {
            toast.error(error.error.message || error.error.statusText);
          },
        },
      );
    },
    validators: {
      onSubmit: z.object({
        email: z.email("Invalid email address"),
        password: z.string().min(8, "Password must be at least 8 characters"),
      }),
    },
  });

  if (isPending) {
    return <Loader />;
  }

  return (
    <main className="mx-auto w-full mt-10 max-w-md p-6">
      <Stack gap="md">
        <Title order={1} ta="center">
          Welcome Back
        </Title>

        <Button type="button" fullWidth loading={isPasskeyPending} onClick={signInWithPasskey}>
          {isPasskeyPending ? "Waiting for passkey..." : "Sign in with passkey"}
        </Button>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <Stack gap="md">
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
                  Sign In
                </Button>
              )}
            </form.Subscribe>
          </Stack>
        </form>

        <Button variant="subtle" onClick={onSwitchToSignUp}>
          Need an account? Sign Up
        </Button>
      </Stack>
    </main>
  );
}
