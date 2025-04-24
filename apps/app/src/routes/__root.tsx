import {
  Outlet,
  createRootRouteWithContext,
  useLocation,
  useRouterState,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";
import topbar from "topbar";
import type { ApiContext } from "../api";
import type { AuthContext } from "../auth";

topbar.config({
  barThickness: 2,
  barColors: {
    "0": "#ff4d00",
    "1": "#ff9a00",
  },
  shadowColor: "rgba(0, 0, 0, .2)",
});

export const Route = createRootRouteWithContext<{
  auth: AuthContext;
  api: ApiContext;
}>()({
  component: RootComponent,
});

function RootComponent() {
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const state = useRouterState();

  useEffect(() => {
    if (state.status === "pending") {
      setLoading(true);
    }
  }, [location]);

  useEffect(() => {
    if (loading && state.status === "idle") {
      setLoading(false);
    }
  }, [loading, state.status]);

  useEffect(() => {
    if (loading) {
      topbar.show();
    } else {
      topbar.hide();
    }
  }, [loading]);

  return <Outlet />;
}
