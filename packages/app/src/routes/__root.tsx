import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import type { AuthContext } from "../auth";

export const Route = createRootRouteWithContext<{ auth: AuthContext }>()({
  component: () => <Outlet />,
});
