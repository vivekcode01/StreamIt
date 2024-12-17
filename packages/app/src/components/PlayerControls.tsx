import { Button } from "@nextui-org/react";
import { usePlayer, usePlayerSelector } from "../context/PlayerContext";
import { useSeekbar } from "../hooks/useSeekbar";

export function PlayerControls() {
  const { player } = usePlayer();
  if (!player) {
    return null;
  }

  return <Controls />;
}

function Controls() {
  const ready = usePlayerSelector((player) => player.ready);
  if (!ready) {
    return null;
  }
  return (
    <div className="flex flex-col gap-2 overflow-hidden">
      <Timing />
      <Seekbar />
      <CuePoints />
      <Info />
      <div className="flex gap-4 items-center justify-center">
        <PlayButton />
      </div>
    </div>
  );
}

function PlayButton() {
  const playOrPause = usePlayerSelector((player) => player.playOrPause);
  const playing = usePlayerSelector(
    (player) => player.playhead === "play" || player.playhead === "playing",
  );

  return (
    <Button isIconOnly onClick={playOrPause}>
      <i className="material-icons">{playing ? "pause" : "play_arrow"}</i>
    </Button>
  );
}

function Info() {
  const live = usePlayerSelector((player) => player.live);
  const time = usePlayerSelector((player) => player.time);
  const duration = usePlayerSelector((player) => player.duration);
  return (
    <div className="flex gap-2 items-center">
      {live ? (
        <div className="text-sm font-mono">
          from live edge: {hms(duration - time)}
        </div>
      ) : null}
    </div>
  );
}

function Seekbar() {
  const seekableStart = usePlayerSelector((player) => player.seekableStart);
  const duration = usePlayerSelector((player) => player.duration);
  const seekTo = usePlayerSelector((player) => player.seekTo);

  const seekbar = useSeekbar({
    min: seekableStart,
    max: duration,
    onSeeked: seekTo,
  });

  return (
    <div
      {...seekbar.rootProps}
      className="w-full relative h-4 bg-gray-200 cursor-pointer"
    />
  );
}

function Timing() {
  const seekableStart = usePlayerSelector((player) => player.seekableStart);
  const time = usePlayerSelector((player) => player.time);
  const duration = usePlayerSelector((player) => player.duration);
  return (
    <div className="w-full flex font-mono relative pt-6 text-xs">
      <div>{hms(seekableStart)}</div>
      <div className="grow" />
      <div>{hms(duration)}</div>
      <div
        className="absolute -translate-x-1/2 top-0 bg-black text-white z-10"
        style={{
          left: `${((time - seekableStart) / (duration - seekableStart)) * 100}%`,
        }}
      >
        {hms(time)}
        <div className="absolute -translate-x-1/2 w-[2px] left-1/2 h-16 top-0 bg-black" />
      </div>
    </div>
  );
}

function CuePoints() {
  const cuePoints = usePlayerSelector((player) => player.cuePoints);
  const duration = usePlayerSelector((player) => player.duration);

  return (
    <div className="relative">
      {cuePoints.map((cuePoint) => {
        return (
          <div
            key={cuePoint}
            style={{ left: `${(cuePoint / duration) * 100}%` }}
            className="absolute  -translate-x-1/2 top-0 w-2 h-2 rounded-full bg-yellow-500"
          >
            <div className="absolute -translate-x-1/2 w-[2px] left-1/2 h-8 bottom-0 bg-yellow-500" />
          </div>
        );
      })}
    </div>
  );
}

function hms(seconds: number) {
  return (
    new Date(seconds * 1000).toUTCString().match(/(\d\d:\d\d:\d\d)/)?.[0] ??
    "00:00:00"
  );
}
