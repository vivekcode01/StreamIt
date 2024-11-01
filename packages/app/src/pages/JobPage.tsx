import { useParams } from "react-router-dom";
import { JobOverview } from "@/components/JobOverview";
import { AutoRefreshProvider } from "@/components/auto-refresh/AutoRefreshContext";

export function JobPage() {
  const { id } = useParams() as { id: string };

  return (
    <AutoRefreshProvider>
      <JobOverview id={id} />
    </AutoRefreshProvider>
  );
}
