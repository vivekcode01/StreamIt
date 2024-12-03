import {
  ControllerProvider,
  Controls,
  useController,
} from "@superstreamer/player/react";
import Hls from "hls.js";
import { useEffect, useState } from "react";
import type { Lang, Metadata } from "@superstreamer/player/react";

interface PlayerProps {
  url?: string | null;
  metadata: Metadata;
  lang: Lang;
}

export function Player({ url, lang, metadata }: PlayerProps) {
  const [hls] = useState(() => new Hls());
  const controller = useController(hls, {
    multipleVideoElements: true,
  });

  useEffect(() => {
    if (url) {
      hls.loadSource(url);
    }
  }, [url]);

  useEffect(() => {
    Object.assign(window, {
      facade: controller.facade,
    });
  }, [controller]);

  return (
    <ControllerProvider controller={controller}>
      <div
        className="relative aspect-video bg-black overflow-hidden rounded-md"
        data-sprs-container
      >
        <video
          ref={controller.mediaRef}
          className="absolute inset-O w-full h-full"
        />
        <Controls lang={lang} metadata={metadata} />
      </div>
    </ControllerProvider>
  );
}
