import { JobsOverview } from "@/components/JobsOverview";
import { AutoRefreshProvider } from "@/components/auto-refresh/AutoRefreshContext";

export function JobsPage() {
  return (
    <AutoRefreshProvider>
      <JobsOverview />
    </AutoRefreshProvider>
  );
}
