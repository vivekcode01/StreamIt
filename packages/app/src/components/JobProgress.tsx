import { Progress } from "@/components/ui/progress";
import type { Job } from "@/api";

type JobProgressProps = {
  progress: Job["progress"];
};

export function JobProgress({ progress }: JobProgressProps) {
  if (!progress) {
    return "N/A";
  }
  const entries = Object.entries(progress);
  const entry = entries.find(([, value]) => {
    return value < 100;
  });
  if (!entry) {
    return "N/A";
  }
  return (
    <div className="relative">
      <div className="flex gap-2 items-center">
        <Progress className="[&>*]:bg-black/20" value={entry[1]} max={100} />
        <div className="min-w-10 text-right">{entry[1]}%</div>
      </div>
      <div className="text-xs absolute left-0 -bottom-4 flex items-center z-10">
        {capFirstLetter(entry[0])}
      </div>
    </div>
  );
}

function capFirstLetter(val: string) {
  return `${val.charAt(0).toUpperCase()}${val.slice(1)}`;
}
