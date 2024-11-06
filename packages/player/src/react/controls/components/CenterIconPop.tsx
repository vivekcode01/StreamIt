import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";
import { useSelector } from "../..";
// import pauseIcon from "../icons/pause.svg";
// import playIcon from "../icons/play.svg";

export interface CenterIconPopRef {
  playOrPause(): void;
}

export const CenterIconPop = forwardRef<CenterIconPopRef, unknown>((_, ref) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const lastNudgeRef = useRef<LastNudge>();
  const playhead = useSelector((facade) => facade.playhead);

  const pushEl = useCallback(
    (value: string) => {
      if (lastNudgeRef.current) {
        lastNudgeRef.current.element.remove();
        clearTimeout(lastNudgeRef.current.timerId);
      }

      const element = document.createElement("div");
      element.innerHTML = `<div class="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center">
        <img class="w-4 h-4 brightness-0 invert" src="${value}" />
      </div>`;
      element.style.transition = "all 500ms ease-out";
      elementRef.current?.appendChild(element);

      const timerId = window.setTimeout(() => {
        element.style.opacity = "0";
        element.style.transform = "scale(2)";
      }, 50);

      lastNudgeRef.current = { element, timerId };
    },
    [elementRef],
  );

  useImperativeHandle(ref, () => {
    return {
      playOrPause() {
        // pushEl(playhead === "pause" ? playIcon : pauseIcon);
      },
    };
  }, [playhead, pushEl]);

  return <div ref={elementRef} />;
});

interface LastNudge {
  element: HTMLDivElement;
  timerId: number;
}
