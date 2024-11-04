import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(dashboard)/_layout/jobs/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  return "Hello /(dashboard)/_layout/jobs/$id!";
}
