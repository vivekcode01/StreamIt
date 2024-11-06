import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "../../../auth";

export const Route = createFileRoute("/(dashboard)/_layout/api")({
  component: RouteComponent,
});

function RouteComponent() {
  const { token } = useAuth();

  return (
    <iframe
      className="w-full h-full"
      src={`${window.__ENV__.PUBLIC_API_ENDPOINT}/swagger?token=${token}`}
    />
  );
}
