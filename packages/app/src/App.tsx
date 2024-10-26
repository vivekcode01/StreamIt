import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import { auth, AuthProvider } from "./AuthContext";
import { JobsPage } from "@/pages/JobsPage";
import { JobPage } from "@/pages/JobPage";
import { ApiPage } from "@/pages/ApiPage";
import { RootLayout } from "@/pages/RootLayout";
import { Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { PlayerPage } from "./pages/PlayerPage";
import { StoragePage } from "./pages/StoragePage";
import { LoginPage } from "./pages/LoginPage";

const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: auth(<RootLayout />),
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
      <Suspense>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </Suspense>
      <Toaster />
    </QueryClientProvider>
  );
}
