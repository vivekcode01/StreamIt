import { Card } from "@nextui-org/react";
import { HlsPlayer } from "@superstreamer/player";
import { useEffect, useRef, useState } from "react";
import { DataDump2 } from "./DataDump2";

interface PlayerProps {
  url?: string | null;
}

export function Player({ url }: PlayerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [player, setPlayer] = useState<HlsPlayer | null>(null);
  const [state, setState] = useState<object>({});

  useEffect(() => {
    const player = new HlsPlayer(ref.current!);
    Object.assign(window, { player });

    player.on("*", () => {
      const obj = {};
      Object.entries(
        Object.getOwnPropertyDescriptors(HlsPlayer.prototype),
      ).forEach(([key, descriptor]) => {
        if (descriptor.get && !key.endsWith("_")) {
          // @ts-expect-error Sanity checked getter
          obj[key] = player[key];
        }
      });
      setState(obj);
    });

    setPlayer(player);

    return () => {
      player.destroy();
    };
  }, []);

  useEffect(() => {
    if (!player || !url) {
      return;
    }
    player.load(url);
    return () => {
      player.unload();
    };
  }, [player, url]);

  return (
    <div className="flex h-full gap-4">
      <div className="grow">
        <div className="relative aspect-video bg-black" ref={ref} />
      </div>
      <Card className="w-full h-full max-w-[360px] p-4 text-sm overflow-y-auto">
        <DataDump2 data={state} redacted={["levels", ".track"]} />
      </Card>
    </div>
  );
}
