import Hls from "hls.js";
import { CaptionsRenderer } from "media-captions";
import { assert } from "shared/assert";
import { EventManager } from "./event-manager";
import { MultiMap } from "./multi-map";
import type { SubtitleStyles } from "./types";
import "media-captions/styles/captions.css";
import "media-captions/styles/regions.css";

const link = document.createElement("link");
link.rel = "stylesheet";
link.href = "https://fonts.cdnfonts.com/css/adriell";
document.body.appendChild(link);

export class TextTrackRenderer {
  private eventManager_ = new EventManager();

  private renderer_: CaptionsRenderer;

  private cache_ = new MultiMap<VTTCue, number>();

  constructor(
    private hls_: Hls,
    root: HTMLDivElement,
    styles?: SubtitleStyles,
  ) {
    const container = document.createElement("div");
    root.appendChild(container);
    this.renderer_ = new CaptionsRenderer(container);

    if (styles) {
      // If we have default styles, we'll pass them on after we
      // created the renderer.
      this.setStyles(styles);
    }

    this.bindHlsListeners_();
    this.bindMediaListeners_();
  }

  private bindHlsListeners_() {
    const listen = this.eventManager_.listen(this.hls_);

    listen(Hls.Events.CUES_PARSED, (_, data) => {
      for (const cue of data.cues) {
        defaultCueProperties(cue);

        const id = this.hls_.subtitleTrack;
        if (!this.cache_.has(id, cue.id)) {
          this.cache_.add(id, cue.id, cue);
          this.renderer_.addCue(cue);
        }
      }
    });

    listen(Hls.Events.SUBTITLE_TRACK_SWITCH, (_, data) => {
      this.renderer_.reset();

      this.cache_.values(data.id).forEach((cue) => {
        this.renderer_.addCue(cue);
      });
    });
  }

  private bindMediaListeners_() {
    const { media } = this.hls_;
    assert(media);
    const listen = this.eventManager_.listen(media);

    listen("timeupdate", () => {
      this.renderer_.currentTime = media.currentTime;
    });
  }

  setStyles(styles: SubtitleStyles) {
    const { overlay } = this.renderer_;

    const lookupMap: Partial<Record<keyof SubtitleStyles, string>> = {
      cueBgColor: "--cue-bg-color",
      cueTextShadow: "--cue-text-shadow",
    };

    Object.entries(styles).forEach(([key, value]) => {
      // @ts-expect-error Lookup
      const prop = lookupMap[key];
      if (prop?.startsWith("--")) {
        overlay.style.setProperty(prop, value);
      } else {
        overlay.style[prop ?? key] = value.toString();
      }
    });
  }

  destroy() {
    this.eventManager_.removeAll();
  }
}

function defaultCueProperties(cue: VTTCue) {
  if (!cue.positionAlign) {
    cue.positionAlign = "center";
  }
}
