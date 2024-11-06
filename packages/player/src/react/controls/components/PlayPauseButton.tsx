import { SqButton } from "./SqButton";
import { useFacade, useSelector } from "../..";
import PauseIcon from "../icons/pause.svg";
import PlayIcon from "../icons/play.svg";

interface PlayPauseButtonProps {
  nudgeVisible(): void;
}

export function PlayPauseButton({ nudgeVisible }: PlayPauseButtonProps) {
  const facade = useFacade();
  const playhead = useSelector((facade) => facade.playhead);

  const canPause = playhead === "play" || playhead === "playing";

  return (
    <SqButton
      onClick={() => {
        facade.playOrPause();
        nudgeVisible();
      }}
      tooltip={canPause ? "button.pause" : "button.play"}
      tooltipPlacement="left"
    >
      {canPause ? (
        <PauseIcon className="w-6 h-6 group-hover:scale-110 transition-transform origin-center" />
      ) : (
        <PlayIcon className="w-6 h-6 group-hover:scale-110 transition-transform origin-center" />
      )}
    </SqButton>
  );
}
