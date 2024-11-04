import { createBrowserRouter, Navigate } from "react-router-dom";
import { AuthAsAuth } from "@/components/AuthAsAuth";
import { AuthAsGuest } from "@/components/AuthAsGuest";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { ApiPage } from "@/pages/ApiPage";
import { AssetsPage } from "@/pages/AssetsPage";
import { JobPage } from "@/pages/JobPage";
import { JobsPage } from "@/pages/JobsPage";
import { LoginPage } from "@/pages/LoginPage";
import { PlayerPage } from "@/pages/PlayerPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { StoragePage } from "@/pages/StoragePage";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: (
      <AuthAsGuest>
        <LoginPage />
      </AuthAsGuest>
    ),
  },
  {
    path: "/",
    element: (
      <AuthAsAuth>
        <DashboardLayout />
      </AuthAsAuth>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/assets" />,
      },
      {
        path: "/assets",
        element: <AssetsPage />,
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
      {
        path: "/settings",
        element: <SettingsPage />,
      },
    ],
  },
]);
