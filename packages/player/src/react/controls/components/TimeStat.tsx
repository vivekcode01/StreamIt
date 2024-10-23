import { toHMS } from "../utils";
import { useSelector } from "../..";
import { useFakeTime } from "../hooks/useFakeTime";

export function TimeStat() {
  const fakeTime = useFakeTime();
  const duration = useSelector((facade) => facade.duration);
  const ended = useSelector((facade) => facade.playhead === "ended");

  let remaining = Math.ceil(duration - fakeTime);
  if (ended) {
    remaining = 0;
  }

  const hms = toHMS(remaining);

  return (
    <div className="whitespace-nowrap flex justify-end items-center text-white ml-4 min-w-12">
      {hms}
    </div>
  );
}
