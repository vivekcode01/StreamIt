import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/auth/_layout")({
  component: LayoutComponent,
});

function LayoutComponent() {
  return (
    <div className="max-w-md w-full mx-auto mt-24 p-4">
      <Outlet />
    </div>
  );
}
