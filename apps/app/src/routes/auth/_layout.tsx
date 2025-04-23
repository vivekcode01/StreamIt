import { Navigate, Outlet, createFileRoute } from "@tanstack/react-router";
import { useAuth } from "../../auth";

export const Route = createFileRoute("/auth/_layout")({
  component: LayoutComponent,
});

function LayoutComponent() {
  const { token } = useAuth();

  if (token) {
    return <Navigate to="/" />;
  }

  return (
    <div className="max-w-md w-full mx-auto mt-20 p-4">
      <img alt="Logo" src="/logo.png" className="max-w-[50px] mx-auto w-full mb-4" />
      <Outlet />
    </div>
  );
}
