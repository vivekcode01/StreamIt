import { Switch } from "@heroui/react";
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
  const [time, setTime] = useState<number>(interval);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    if (time === 0) {
      router.invalidate();
    }

    const timerId = window.setTimeout(() => {
      setTime((old) => (old === 0 ? interval : old - 1));
    }, 1000);

    return () => {
      clearTimeout(timerId);
    };
  }, [enabled, interval, time]);

  return (
    <div className="flex items-center gap-2">
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
