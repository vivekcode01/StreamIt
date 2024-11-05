import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/(dashboard)/_layout/")({
  beforeLoad: () => {
    throw redirect({ to: "/assets" });
  },
});
