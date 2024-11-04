import LoaderIcon from "lucide-react/icons/loader";
import { cn } from "@/lib/utils";

interface LoaderProps {
  className?: string;
}

export function Loader({ className }: LoaderProps) {
  return (
    <div className={cn("flex justify-center items-center", className)}>
      <LoaderIcon className="animate-spin" />
    </div>
  );
}
