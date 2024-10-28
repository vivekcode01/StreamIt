import { Switch } from "@/components/ui/switch";
import { Loader } from "@/components/Loader";
import { cn } from "@/lib/utils";
import type { AutoRefetch } from "./useAutoRefetch";

type AutoRefetchToggleProps = {
  autoRefetch: AutoRefetch;
};

export function AutoRefetchToggle({ autoRefetch }: AutoRefetchToggleProps) {
  const { active, countdown, toggle } = autoRefetch;

  return (
    <div className="relative flex items-center">
      <div
        className={cn(
          "absolute right-1 z-10 pointer-events-none transition-opacity opacity-0",
          active && "opacity-100",
        )}
      >
        <div className="w-4 flex items-center justify-center">
          {countdown === 0 ? (
            <Loader className="w-3 h-3" />
          ) : (
            <span className="text-xs">{countdown}</span>
          )}
        </div>
      </div>
      <Switch checked={active} onCheckedChange={toggle} />
    </div>
  );
}
