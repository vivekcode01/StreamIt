import cn from "clsx";
import { useFacade, useSelector } from "../..";
import LoaderIcon from "../icons/loader.svg";
import PlayIcon from "../icons/play.svg";

export function Start() {
  const facade = useFacade();
  const ready = useSelector((facade) => facade.ready);
  const started = useSelector((facade) => facade.started);
  const play = useSelector((facade) => facade.playhead === "play");

  let hidden = started;
  if (!ready) {
    hidden = true;
  }

  const loading = play && !started;

  return (
    <button
      className={cn(
        "absolute inset-0 bg-black/30 z-50 transition-opacity text-white flex items-center justify-center group",
        hidden && "opacity-0 pointer-events-none",
      )}
      onClick={() => facade.playOrPause()}
    >
      {loading ? (
        <LoaderIcon className="w-8 h-8 animate-spin" />
      ) : (
        <div className="p-4 bg-black/50 rounded-full group-active:scale-90 transition-transform">
          <PlayIcon className="w-8 h-8 group-hover:scale-110 transition-transform" />
        </div>
      )}
    </button>
  );
}
