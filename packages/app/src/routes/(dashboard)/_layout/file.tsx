import { createFileRoute } from "@tanstack/react-router";
import { zodSearchValidator } from "@tanstack/router-zod-adapter";
import z from "zod";

export const Route = createFileRoute("/(dashboard)/_layout/file")({
  component: RouteComponent,
  validateSearch: zodSearchValidator(
    z.object({
      path: z.string().default("/"),
    }),
  ),
});

function RouteComponent() {
  const { path } = Route.useSearch();

  return <div>{path}</div>;
}
