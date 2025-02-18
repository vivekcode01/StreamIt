import { Button } from "@heroui/react";
import { Events } from "@superstreamer/player";
import cn from "clsx";
import { useEffect, useRef, useState } from "react";
import { Selection } from "./Selection";
import { usePlayer, usePlayerSelector } from "../context/PlayerContext";
import { useSeekbar } from "../hooks/useSeekbar";
import type { ReactNode, RefObject } from "react";

export function PlayerControls() {
  const ready = usePlayerSelector((player) => player.ready);
  if (!ready) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4 overflow-hidden">
      <div className="flex justify-center items-center">
        <PlayButton />
        <div className="ml-auto max-w-64 w-full">
          <Qualities />
        </div>
      </div>
      <div className="p-3 rounded-md bg-default-100">
        <Seekbar />
        <Time />
        <div>
          <span className="text-xs">Timeline</span>
          <Timeline />
        </div>
      </div>
      <Tracks />
    </div>
  );
}

function PlayButton() {
  const playOrPause = usePlayerSelector((player) => player.playOrPause);
  const playing = usePlayerSelector(
    (player) => player.playhead === "play" || player.playhead === "playing",
  );

  return (
    <Button isIconOnly onPress={playOrPause}>
      <i className="material-icons">{playing ? "pause" : "play_arrow"}</i>
    </Button>
  );
}

function Seekbar() {
  const seekableStart = usePlayerSelector((player) => player.seekableStart);
  const currentTime = usePlayerSelector((player) => player.currentTime);
  const duration = usePlayerSelector((player) => player.duration);
  const seekTo = usePlayerSelector((player) => player.seekTo);

  const { seekTargetTime, setSeekTargetTime } = useSeekTargetTime();

  const seekbar = useSeekbar({
    min: seekableStart,
    max: duration,
    onSeeked: (time) => {
      seekTo(time);
      setSeekTargetTime(time);
    },
  });

  const fakeTime = seekTargetTime ?? currentTime;
  let percentage = getPercentage(fakeTime, duration, seekableStart);
  if (seekbar.seeking) {
    percentage = seekbar.x;
  }

  return (
    <div {...seekbar.rootProps} className="w-full relative cursor-pointer py-2">
      <Tooltip
        x={seekbar.x}
        seekbarRef={seekbar.rootProps.ref}
        visible={seekbar.active}
      >
        {hms(seekbar.value)}
      </Tooltip>
      <div className="relative flex items-center h-1">
        <div className="h-1 bg-default-200 w-full" />
        <div
          className={cn(
            "h-1 absolute left-0 right-0 bg-default-300 origin-left opacity-0 transition-opacity",
            seekbar.hover && "opacity-100",
          )}
          style={{
            transform: `scaleX(${seekbar.x})`,
          }}
        />
        <div
          className={cn("h-1 absolute left-0 right-0 bg-black origin-left")}
          style={{
            transform: `scaleX(${percentage})`,
          }}
        />
        <div
          className="h-4 absolute w-[3px] bg-black rounded-full -translate-x-1/2 outline-default-100 outline outline-2 z-10"
          style={{
            left: `${percentage * 100}%`,
          }}
        />
      </div>
    </div>
  );
}

function Tooltip({
  x,
  seekbarRef,
  visible,
  children,
}: {
  x: number;
  seekbarRef: RefObject<HTMLDivElement>;
  visible: boolean;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  if (ref.current && seekbarRef.current) {
    const seekbarRect = seekbarRef.current.getBoundingClientRect();
    const rect = ref.current.getBoundingClientRect();
    const offset = rect.width / 2 / seekbarRect.width;
    if (x < offset) {
      x = offset;
    } else if (x > 1 - offset) {
      x = 1 - offset;
    }
  }

  return (
    <div
      ref={ref}
      className={cn(
        "pointer-events-none absolute h-6 -top-6 -translate-x-1/2 opacity-0 transition-opacity text-xs text-white bg-black px-1 flex items-center rounded-md",
        visible && "opacity-100",
      )}
      style={{
        left: `${x * 100}%`,
      }}
    >
      {children}
    </div>
  );
}

function Timeline() {
  const timeline = usePlayerSelector((player) => player.timeline);
  const duration = usePlayerSelector((player) => player.duration);
  const seekableStart = usePlayerSelector((player) => player.seekableStart);

  const relativeDuration = duration - seekableStart;

  return (
    <div className="relative h-2 bg-default-200 mt-2">
      {timeline.map((item) => {
        const left = (item.start - seekableStart) / relativeDuration;
        const width = item.duration ? item.duration / relativeDuration : 0;
        const rangeWidth = item.rangeDuration
          ? item.rangeDuration / relativeDuration
          : 0;

        if (!width) {
          // It's a point
          return (
            <div
              className="absolute inset-0 w-[3px] bg-amber-500 origin-center"
              style={{ left: `${left * 100}%` }}
            />
          );
        }

        // It's a range
        return (
          <>
            {rangeWidth ? (
              <div
                key={`range${item.start}`}
                style={{
                  left: `${left * 100}%`,
                  width: `${rangeWidth * 100}%`,
                }}
                className="absolute inset-0 bg-blue-400"
              />
            ) : null}
            <div
              key={item.start}
              style={{
                left: `${left * 100}%`,
                width: `${width * 100}%`,
              }}
              className="absolute inset-0 bg-amber-500"
            />
          </>
        );
      })}
    </div>
  );
}

function Time() {
  const currentTime = usePlayerSelector((player) => player.currentTime);
  const seekableStart = usePlayerSelector((player) => player.seekableStart);
  const duration = usePlayerSelector((player) => player.duration);
  const live = usePlayerSelector((player) => player.live);

  return (
    <div className="flex text-sm">
      {hms(currentTime)}
      <div className="grow" />
      {live ? `${hms(seekableStart)} - ${hms(duration)}` : `${hms(duration)}`}
    </div>
  );
}

function Tracks() {
  const audioTracks = usePlayerSelector((player) => player.audioTracks);
  const setAudioTrack = usePlayerSelector((player) => player.setAudioTrack);

  const subtitleTracks = usePlayerSelector((player) => player.subtitleTracks);
  const setSubtitleTrack = usePlayerSelector(
    (player) => player.setSubtitleTrack,
  );

  return (
    <div className="flex gap-4">
      <Selection
        items={audioTracks}
        label="Audio"
        getActive={(item) => item.active}
        getKey={(item) => item.id}
        getLabel={(item) => item.label}
        onChange={(item) => setAudioTrack(item.id)}
      />
      <Selection
        items={[
          ...subtitleTracks,
          {
            id: null,
            label: "None",
            active: !subtitleTracks.some((item) => item.active),
          },
        ]}
        getActive={(item) => item.active}
        label="Subtitles"
        getKey={(item) => item.id}
        getLabel={(item) => item.label}
        onChange={(item) => setSubtitleTrack(item.id)}
      />
    </div>
  );
}

function Qualities() {
  const qualities = usePlayerSelector((player) => player.qualities);
  const autoQuality = usePlayerSelector((player) => player.autoQuality);
  const setQuality = usePlayerSelector((player) => player.setQuality);

  return (
    <Selection
      items={[
        ...qualities,
        {
          height: null,
          active: autoQuality,
        },
      ]}
      label="Quality"
      getActive={(item) => item.active}
      getKey={(item) => item.height}
      getLabel={(item) => item.height?.toString() ?? "Auto"}
      onChange={(item) => setQuality(item.height)}
    />
  );
}

function hms(seconds: number) {
  return (
    new Date(seconds * 1000).toUTCString().match(/(\d\d:\d\d:\d\d)/)?.[0] ??
    "00:00:00"
  );
}

function getPercentage(time: number, duration: number, seekableStart: number) {
  if (Number.isNaN(duration)) {
    return 0;
  }

  let timeRel = time - seekableStart;
  const durationRel = duration - seekableStart;

  if (timeRel < 0) {
    timeRel = 0;
  } else if (timeRel > durationRel) {
    timeRel = durationRel;
  }

  const percentage = timeRel / durationRel;

  return percentage;
}

function useSeekTargetTime() {
  const [seekTargetTime, setSeekTargetTime] = useState<number | null>(null);
  const { player } = usePlayer();

  useEffect(() => {
    if (!player) {
      return;
    }

    player.on(Events.SEEKING_CHANGE, () => {
      if (!player.seeking) {
        setSeekTargetTime(null);
      }
    });
  }, [player]);

  return { seekTargetTime, setSeekTargetTime };
}
