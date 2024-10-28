import { Switch } from "@/components/ui/switch";
import { Loader } from "@/components/Loader";
import { useAutoRefetch } from "./AutoRefetchProvider";

export function AutoRefetchToggle() {
  const { active, toggle, countdown } = useAutoRefetch();
  return (
    <div className="relative flex items-center">
      <div className="absolute right-1 z-10 pointer-events-none">
        {countdown !== null ? (
          <div className="w-4 flex items-center justify-center">
            {countdown === 0 ? (
              <Loader className="w-3 h-3" />
            ) : (
              <span className="text-xs">{countdown}</span>
            )}
          </div>
        ) : null}
      </div>
      <Switch checked={active} onCheckedChange={toggle} />
    </div>
  );
}
