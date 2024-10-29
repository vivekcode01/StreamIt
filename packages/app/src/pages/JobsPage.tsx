import { AutoRefreshProvider } from "@/components/auto-refresh/AutoRefreshContext";
import { JobsOverview } from "@/components/JobsOverview";

export function JobsPage() {
  return (
    <AutoRefreshProvider>
      <JobsOverview />
    </AutoRefreshProvider>
  );
}
