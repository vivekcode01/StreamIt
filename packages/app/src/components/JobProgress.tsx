import { Progress } from "@/components/ui/progress";
import type { Job } from "@/api";

type JobProgressProps = {
  progress: Job["progress"];
};

export function JobProgress({ progress }: JobProgressProps) {
  const value = progress?.find((tuple) => tuple[1] < 100);
  if (!value) {
    return "N/A";
  }
  const [name, percent] = value;
  return (
    <div>
      <div className="text-xs">{name}</div>
      <Progress value={percent} />
    </div>
  );
}
