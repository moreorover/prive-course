import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/admin/courses/$courseId")({
  component: CourseAdminLayout,
});

function CourseAdminLayout() {
  return <Outlet />;
}
