import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";

import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/courses/$courseSlug")({
  component: CourseLayout,
  beforeLoad: async () => {
    const session = await authClient.getSession();
    if (!session.data) {
      throw redirect({
        to: "/login",
      });
    }
    return { session };
  },
});

function CourseLayout() {
  return <Outlet />;
}
