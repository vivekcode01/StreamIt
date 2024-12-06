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

class SuperstreamerVideoElement extends MediaTracksMixin(
  globalThis.HTMLElement,
) {
  static getTemplateHTML = getTemplateHTML;

  static shadowRootOptions = {
    mode: "open",
  };

  static observedAttributes = ["src"];

  #player;

  get src() {
    return this.getAttribute("src");
  }

  set src(val) {
    if (this.src === val) {
      return;
    }
    this.setAttribute("src", val);
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

    if (!this.#player) {
      const container = this.shadowRoot.querySelector(".container");
      const player = (this.#player = new HlsPlayer(container));

      // TODO: Remove this.
      Object.assign(window, { player });

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

      player.on(Events.READY, () => {
        this.dispatchEvent(new Event("loadedmetadata"));
        this.dispatchEvent(new Event("durationchange"));
        this.dispatchEvent(new Event("loadcomplete"));
      });
    }

    this.#player.load(this.src);
  }

  get currentTime() {
    return this.#player.time;
  }

  set currentTime(val) {
    if (this.currentTime === val) {
      return;
    }
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
    return 3;
  }

  get muted() {
    return this.#player.volume === 0;
  }

  set muted(val) {
    if (this.muted || !val) {
      return;
    }
    this.#player.setVolume(0);
  }

  get volume() {
    return this.#player.volume;
  }

  set volume(val) {
    if (this.volume === val) {
      return;
    }
    this.#player.setVolume(val);
  }

  async play() {
    this.#player.playOrPause();
  }

  pause() {
    this.#player.playOrPause();
  }
}

if (!globalThis.customElements?.get("superstreamer-video")) {
  globalThis.customElements.define(
    "superstreamer-video",
    SuperstreamerVideoElement,
  );
}

export default SuperstreamerVideoElement;
