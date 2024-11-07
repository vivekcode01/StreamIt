import {
  createRootRouteWithContext,
  Outlet,
  useRouterState,
} from "@tanstack/react-router";
import { useEffect } from "react";
import topbar from "topbar";
import type { AuthContext } from "../auth";

topbar.config({
  barThickness: 2,
  barColors: {
    "0": "#ff4d00",
    "1": "#ff9a00",
  },
  shadowColor: "rgba(0, 0, 0, .2)",
});

export const Route = createRootRouteWithContext<{ auth: AuthContext }>()({
  component: RootComponent,
});

function RootComponent() {
  const state = useRouterState();

  useEffect(() => {
    if (state.status === "idle") {
      topbar.hide();
    } else if (state.status === "pending") {
      topbar.show();
    }
  }, [state.status]);

  return <Outlet />;
}
