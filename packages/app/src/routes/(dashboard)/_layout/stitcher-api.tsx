import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(dashboard)/_layout/stitcher-api")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <iframe
      className="w-full h-full"
      src={`${window.__ENV__.PUBLIC_STITCHER_ENDPOINT}/swagger`}
    />
  );
}
