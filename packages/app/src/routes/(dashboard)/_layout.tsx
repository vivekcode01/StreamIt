import { createFileRoute, Navigate, Outlet } from "@tanstack/react-router";
import { Sidebar } from "../../components/Sidebar";
import { useUser } from "../../hooks/useUser";

export const Route = createFileRoute("/(dashboard)/_layout")({
  component: LayoutComponent,
});

function LayoutComponent() {
  const { user } = useUser();

  if (!user) {
    return <Navigate to="/auth/sign-in" />;
  }

  return (
    <div className="w-screen h-screen flex">
      <div className="p-4 border-r">
        <Sidebar />
      </div>
      <div className="grow basis-0 overflow-auto p-8 h-screen bg-gray-50">
        <Outlet />
      </div>
    </div>
  );
}
