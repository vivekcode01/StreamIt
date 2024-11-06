import { Switch } from "@nextui-org/react";
import { useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";

interface AutoRefreshProps {
  defaultEnabled?: boolean;
  interval: number;
}

export function AutoRefresh({
  defaultEnabled = false,
  interval,
}: AutoRefreshProps) {
  const router = useRouter();
  const [enabled, setEnabled] = useState(defaultEnabled);
  const [time, setTime] = useState<number>(0);

  useEffect(() => {
    if (!enabled) {
      return;
    }
    if (time === -1) {
      setTime(interval);
      router.invalidate();
    }
    const intervalId = window.setTimeout(() => {
      setTime((old) => old - 1);
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [enabled, interval, time]);

  return (
    <div className="flex items-center">
      <Switch
        size="sm"
        isSelected={enabled}
        onValueChange={(value) => {
          setEnabled(value);
          if (value) {
            setTime(interval);
          }
        }}
      />
      {enabled ? (
        <span className="text-xs">
          {time !== 0 ? `Refresh in ${time}` : "Refreshing"}
        </span>
      ) : null}
    </div>
  );
}
