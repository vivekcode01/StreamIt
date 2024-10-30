import { Loader } from "@/components/Loader";
import { useAutoRefresh } from "./AutoRefreshContext";

export function AutoRefreshStatus() {
  const { countdown } = useAutoRefresh();

  if (countdown === null) {
    return null;
  }

  return (
    <div className="text-xs w-3 flex justify-center">
      {countdown === 0 ? <Loader className="w-3 h-3" /> : countdown}
    </div>
  );
}
