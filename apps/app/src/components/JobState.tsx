import cn from "clsx";
import {
  CircleCheck,
  CircleDashed,
  CircleDotDashed,
  CircleX,
} from "lucide-react";
import type { Job } from "@superstreamer/api/client";
import type { ReactNode } from "react";

interface JobStateProps {
  job: Job;
}

export function JobState({ job }: JobStateProps) {
  const className = "w-4 h-4";

  const iconMap: Record<Job["state"], ReactNode> = {
    running: (
      <CircleDashed className={cn(className, "animate-spin text-sky-500")} />
    ),
    failed: <CircleX className={cn(className, "text-red-500")} />,
    completed: <CircleCheck className={cn(className, "text-green-500")} />,
    waiting: <CircleDotDashed className={cn(className, "text-indigo-500")} />,
  };
  return iconMap[job.state];
}
