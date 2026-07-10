import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";

export type SessionData = NonNullable<ReturnType<typeof authClient.useSession>["data"]>;
export type PasskeyData = NonNullable<
  ReturnType<typeof authClient.useListPasskeys>["data"]
>[number];
export type SessionListItem = Awaited<ReturnType<typeof loadSessions>>[number];

export function formatDate(value: Date | string) {
  return new Date(value).toLocaleString();
}

export async function loadSessions() {
  const result = await authClient.listSessions();

  if (result.error) {
    throw new Error(result.error.message || result.error.statusText);
  }

  return result.data ?? [];
}

export async function addPasskey() {
  const result = await authClient.passkey.addPasskey({
    name: "Account passkey",
  });

  if (result.error) {
    toast.error(result.error.message || result.error.statusText);
    return false;
  }

  toast.success("Passkey added");
  return true;
}
