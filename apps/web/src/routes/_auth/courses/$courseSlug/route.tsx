import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/courses/$courseSlug")({
  component: CourseLayout,
});

function CourseLayout() {
  return <Outlet />;
}
