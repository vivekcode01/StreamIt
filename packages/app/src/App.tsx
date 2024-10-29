import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import { Auth, Guest, AuthProvider } from "./AuthContext";
import { ApiProvider } from "./ApiContext";
import { JobsPage } from "@/pages/JobsPage";
import { JobPage } from "@/pages/JobPage";
import { ApiPage } from "@/pages/ApiPage";
import { RootLayout } from "@/pages/RootLayout";
import { Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { PlayerPage } from "./pages/PlayerPage";
import { StoragePage } from "./pages/StoragePage";
import { LoginPage } from "./pages/LoginPage";
import { Loader } from "@/components/Loader";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // staleTime: 0,
      // gcTime: 0,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      retry: 0,
    },
  },
});

const router = createBrowserRouter([
  {
    path: "/login",
    element: (
      <Guest>
        <LoginPage />
      </Guest>
    ),
  },
  {
    path: "/",
    element: (
      <Auth>
        <RootLayout />
      </Auth>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/jobs" />,
      },
      {
        path: "/jobs",
        element: <JobsPage />,
      },
      {
        path: "/jobs/:id",
        element: <JobPage />,
      },
      {
        path: "/api/:service?",
        element: <ApiPage />,
      },
      {
        path: "/player",
        element: <PlayerPage />,
      },
      {
        path: "/storage",
        element: <StoragePage />,
      },
    ],
  },
]);

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={<AppLoader />}>
        <AuthProvider>
          <ApiProvider>
            <RouterProvider router={router} />
          </ApiProvider>
        </AuthProvider>
      </Suspense>
      <Toaster />
    </QueryClientProvider>
  );
}

function AppLoader() {
  return (
    <div className="w-screen h-screen flex items-center justify-center">
      <Loader />
    </div>
  );
}
