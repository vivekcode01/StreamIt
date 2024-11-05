import { Spinner } from "@nextui-org/react";
import { createFileRoute, Navigate, Outlet } from "@tanstack/react-router";
import { Suspense } from "react";
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
      <div className="p-4 border-r max-w-[160px] w-full">
        <Sidebar />
      </div>
      <div className="grow basis-0 overflow-auto h-screen bg-gray-50">
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </div>
    </div>
  );
}

function PageLoader() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <Spinner />
    </div>
  );
}
