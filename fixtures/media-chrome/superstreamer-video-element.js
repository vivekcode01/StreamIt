import { Events, HlsPlayer } from "@superstreamer/player";
import { MediaTracksMixin } from "media-tracks";

function getTemplateHTML() {
  return `
    <style>
      :host {
        width: 100%;
        height: 100%;
      }
    </style>
    <div class="container"></div>
  `;
}

const symbolTrackId_ = Symbol("superstreamer.trackId");

class SuperstreamerVideoElement extends MediaTracksMixin(
  globalThis.HTMLElement,
) {
  static getTemplateHTML = getTemplateHTML;

  static shadowRootOptions = {
    mode: "open",
  };

  static observedAttributes = ["src"];

  #player;

  #readyState = 0;

  #video;

  get src() {
    return this.getAttribute("src");
  }

  set src(val) {
    if (this.src === val) {
      return;
    }
    this.setAttribute("src", val);
  }

  get textTracks() {
    return this.#video.textTracks;
  }

  attributeChangedCallback(attrName, oldValue, newValue) {
    if (attrName === "src" && oldValue !== newValue) {
      this.load();
    }
  }

  load() {
    if (!this.shadowRoot) {
      this.attachShadow({
        mode: "open",
      });
      this.shadowRoot.innerHTML = getTemplateHTML();
    }

    this.#readyState = 0;
    this.dispatchEvent(new Event("emptied"));

    this.#video = document.createElement("video");
    
    if (!this.#player) {
      const container = this.shadowRoot.querySelector(".container");
      const player = (this.#player = new HlsPlayer(container));

      // TODO: For debug purposes.
      Object.assign(window, { player });

      player.on(Events.PLAYHEAD_CHANGE, () => {
        switch (player.playhead) {
          case "play":
            this.dispatchEvent(new Event("play"));
            break;
          case "playing":
            this.dispatchEvent(new Event("playing"));
            break;
          case "pause":
            this.dispatchEvent(new Event("pause"));
            break;
        }
      });

      player.on(Events.TIME_CHANGE, () => {
        this.dispatchEvent(new Event("timeupdate"));
      });

      player.on(Events.VOLUME_CHANGE, () => {
        this.dispatchEvent(new Event("volumechange"));
      });

      player.on(Events.SEEKING_CHANGE, () => {
        if (player.seeking) {
          this.dispatchEvent(new Event("seeking"));
        } else {
          this.dispatchEvent(new Event("seeked"));
        }
      })

      player.on(Events.READY, async () => {
        this.dispatchEvent(new Event("loadedmetadata"));
        this.dispatchEvent(new Event("durationchange"));
        this.dispatchEvent(new Event("volumechange"));
        this.dispatchEvent(new Event("loadcomplete"));

        this.#createVideoTracks();
        this.#createAudioTracks();
        this.#createTextTracks();

        this.#readyState = 1;
      });

      player.on(Events.STARTED, () => {
        this.#readyState = 3;
      });
    }

    this.dispatchEvent(new Event("loadstart"));

    this.#player.load(this.src);
  }

  get currentTime() {
    return this.#player.time;
  }

  set currentTime(val) {
    this.#player.seekTo(val);
  }

  get duration() {
    return this.#player.duration;
  }

  get paused() {
    const { playhead } = this.#player;
    if (playhead === "play" || playhead === "playing") {
      return false;
    }
    return true;
  }

  get readyState() {
    return this.#readyState;
  }

  get muted() {
    return this.#player.volume === 0;
  }

  set muted(val) {
    this.#player.setVolume(val ? 0 : 1);
  }

  get volume() {
    return this.#player.volume;
  }

  set volume(val) {
    this.#player.setVolume(val);
  }

  async play() {
    this.#player.playOrPause();
  }

  pause() {
    this.#player.playOrPause();
  }

  #createVideoTracks() {
    let videoTrack = this.videoTracks.getTrackById("main");

    if (!videoTrack) {
      videoTrack = this.addVideoTrack("main");
      videoTrack.id = "main";
      videoTrack.selected = true;
    }

    this.#player.qualities.forEach((quality) => {
      videoTrack.addRendition(
        undefined,
        quality.height,
        quality.height,
        undefined,
        undefined,
      );
    });

    this.videoRenditions.addEventListener("change", (event) => {
      if (event.target.selectedIndex < 0) {
        this.#player.setQuality(null);
      } else {
        const rendition = this.videoRenditions[event.target.selectedIndex];
        this.#player.setQuality(rendition.height);
      }
    });
  }

  #createAudioTracks() {
    this.#player.audioTracks.forEach((a) => {
      const audioTrack = this.addAudioTrack("main", a.label, a.label);
      audioTrack[symbolTrackId_] = a.id;
      audioTrack.enabled = a.active;
    });

    this.audioTracks.addEventListener("change", () => {
      const track = [...this.audioTracks].find((a) => a.enabled);
      if (track) {
        const id = track[symbolTrackId_];
        this.#player.setAudioTrack(id);
      }
    });
  }

  #createTextTracks() {
    this.#player.subtitleTracks.forEach((s) => {
      const textTrack = this.addTextTrack("subtitles", s.label, s.track.lang);
      textTrack[symbolTrackId_] = s.id;
    });

    this.textTracks.addEventListener("change", () => {
      const track =
        [...this.textTracks].find((t) => t.mode === "showing");
      if (track) {
        const id = track[symbolTrackId_];
        this.#player.setSubtitleTrack(id);
      } else {
        this.#player.setSubtitleTrack(null);
      }
    });
  }

  addTextTrack(kind, label, language) {
    const trackEl = document.createElement('track');
    trackEl.kind = kind;
    trackEl.label = label;
    trackEl.srclang = language;
    trackEl.track.mode = "hidden";
    this.#video.append(trackEl);
    return trackEl.track;
  }
}

if (!globalThis.customElements?.get("superstreamer-video")) {
  globalThis.customElements.define(
    "superstreamer-video",
    SuperstreamerVideoElement,
  );
}

export default SuperstreamerVideoElement;
