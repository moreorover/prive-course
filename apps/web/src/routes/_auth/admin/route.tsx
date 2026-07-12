import { Navigate, Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const { session } = Route.useRouteContext();

  if (session.data?.user.role !== "admin") {
    return <Navigate to="/courses" />;
  }

  return <Outlet />;
}
