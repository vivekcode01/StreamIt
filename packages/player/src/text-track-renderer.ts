import Hls from "hls.js";
import { CaptionsRenderer } from "media-captions";
import { assert } from "shared/assert";
import { EventManager } from "./event-manager";
import "media-captions/styles/captions.css";
import "media-captions/styles/regions.css";

const link = document.createElement("link");
link.rel = "stylesheet";
link.href = "https://fonts.cdnfonts.com/css/adriell";
document.body.appendChild(link);

export class TextTrackRenderer {
  private eventManager_ = new EventManager();

  private renderer_: CaptionsRenderer;

  private cache_ = new Map<number, Map<string, VTTCue>>();

  constructor(
    private hls_: Hls,
    root: HTMLDivElement,
  ) {
    hls_.config.renderTextTracksNatively = false;

    const container = document.createElement("div");
    container.style.fontWeight = "700";
    container.style.setProperty("--cue-bg-color", "rgba(0, 0, 0, 0)");
    container.style.setProperty(
      "--cue-text-shadow",
      "rgb(0, 0, 0) 0px 0px 7px",
    );
    root.appendChild(container);
    this.renderer_ = new CaptionsRenderer(container);

    this.bindHlsListeners_();
    this.bindMediaListeners_();
  }

  private bindHlsListeners_() {
    const listen = this.eventManager_.listen(this.hls_);

    listen(Hls.Events.NON_NATIVE_TEXT_TRACKS_FOUND, (_, data) => {
      for (const track of data.tracks) {
        if (!track.subtitleTrack) {
          continue;
        }
        this.cache_.set(track.subtitleTrack.id, new Map());
      }
    });

    listen(Hls.Events.CUES_PARSED, (_, data) => {
      for (const cue of data.cues) {
        defaultCueProperties(cue);
        const map = this.cache_.get(this.hls_.subtitleTrack);
        if (!map || map.has(cue.id)) {
          continue;
        }
        map.set(cue.id, cue);
        this.renderer_.addCue(cue);
      }
    });

    listen(Hls.Events.SUBTITLE_TRACK_SWITCH, (_, data) => {
      this.renderer_.reset();

      const map = this.cache_.get(data.id);
      if (!map) {
        return;
      }

      map.values().forEach((cue) => {
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

  destroy() {
    this.eventManager_.removeAll();
  }
}

function defaultCueProperties(cue: VTTCue) {
  if (!cue.positionAlign) {
    cue.positionAlign = "center";
  }
}
