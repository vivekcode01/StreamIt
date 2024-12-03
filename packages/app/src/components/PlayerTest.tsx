import { HlsPlayer } from "@superstreamer/player/player";
import { useEffect, useRef, useState } from "react";

interface PlayerTestProps {
  url?: string | null;
}

export function PlayerTest({ url }: PlayerTestProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [player, setPlayer] = useState<HlsPlayer | null>(null);

  useEffect(() => {
    const player = new HlsPlayer(ref.current!);
    setPlayer(player);
  }, []);

  useEffect(() => {
    if (!player || !url) {
      return;
    }
    player.load(url);
    return () => {
      player.reset();
    };
  }, [player, url]);

  return <div className="relative aspect-video bg-black" ref={ref} />;
}
