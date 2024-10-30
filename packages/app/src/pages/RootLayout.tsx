import { Outlet, useLocation } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";
import { Sidebar } from "@/components/Sidebar";
import { RootLayoutErrorBoundary } from "./RootLayoutErrorBoundary";

export function RootLayout() {
  const location = useLocation();

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr]">
      <aside className="border-r">
        <Sidebar />
      </aside>
      <div className="flex flex-col flex-1 overflow-y-auto">
        <main className="flex flex-col grow">
          <ErrorBoundary
            key={location.pathname}
            FallbackComponent={RootLayoutErrorBoundary}
          >
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
