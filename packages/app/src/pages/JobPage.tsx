import { useParams } from "react-router-dom";
import { AutoRefreshProvider } from "@/components/auto-refresh/AutoRefreshContext";
import { JobOverview } from "@/components/JobOverview";

export function JobPage() {
  const { id } = useParams() as { id: string };

  return (
    <AutoRefreshProvider>
      <JobOverview id={id} />
    </AutoRefreshProvider>
  );
}
