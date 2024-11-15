import {
  forwardRef,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useSelector } from "../..";
import PauseIcon from "../icons/pause.svg";
import PlayIcon from "../icons/play.svg";
import type { ReactNode } from "react";

export interface CenterIconPopRef {
  playOrPause(): void;
}

export const CenterIconPop = forwardRef<CenterIconPopRef, unknown>((_, ref) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const playhead = useSelector((facade) => facade.playhead);
  const [nudge, setNudge] = useState<ReactNode>(null);

  useLayoutEffect(() => {
    const el = elementRef.current;
    if (!el) {
      return;
    }

    let timerId: number;

    const stage = (timeout: number) =>
      new Promise((resolve) => {
        timerId = window.setTimeout(() => {
          resolve(undefined);
        }, timeout);
      });

    const runStages = async () => {
      el.style.transform = "";
      el.style.transition = "";
      el.style.opacity = "0";
      await stage(10);
      el.style.opacity = "1";
      await stage(50);
      el.style.transition = "all 500ms ease-out";
      el.style.opacity = "0";
      el.style.transform = "scale(2)";
    };
    runStages();

    return () => {
      clearTimeout(timerId);
    };
  }, [nudge]);

  useImperativeHandle(ref, () => {
    return {
      playOrPause() {
        setNudge(
          playhead === "pause" ? (
            <PlayIcon className="w-4 h-4" />
          ) : (
            <PauseIcon className="w-4 h-4" />
          ),
        );
      },
    };
  }, [playhead]);

  return (
    <div>
      <div
        ref={elementRef}
        className="text-white w-10 h-10 rounded-full bg-black/50 flex items-center justify-center"
      >
        {nudge}
      </div>
    </div>
  );
});
