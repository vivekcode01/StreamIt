import Hls from "hls.js";
import { EventManager } from "./event-manager";
import { State } from "./state";

export class HlsPlayer {
  private primaryMedia_: HTMLMediaElement;

  private assetMedias_: [HTMLMediaElement, HTMLMediaElement];

  private assetMediaIndex_ = 0;

  private eventManager_ = new EventManager();

  private activeMedia_: HTMLMediaElement;

  private hls_: Hls | null = null;

  private state_: State | null = null;

  constructor(public container: HTMLDivElement) {
    this.primaryMedia_ = this.activeMedia_ = this.createMedia_();

    this.assetMedias_ = [this.createMedia_(), this.createMedia_()];

    this.allMedias_.forEach((media) => {
      this.addMediaListeners_(media);
    });

    this.setActiveMedia_(this.primaryMedia_);

    // Temporary, for debug purposes.
    Object.assign(window, {
      player: this,
    });
  }

  private createMedia_() {
    const media = document.createElement("video");
    this.container.appendChild(media);

    media.style.position = "absolute";
    media.style.inset = "0";
    media.style.width = "100%";
    media.style.height = "100%";

    return media;
  }

  load(url: string) {
    const hls = this.createHls_();

    this.state_ = new State({
      getTiming() {
        const { media } = hls;
        return media ? [media.currentTime, media.duration] : null;
      },
    });

    hls.attachMedia(this.primaryMedia_);
    hls.loadSource(url);

    this.hls_ = hls;
  }

  reset() {
    this.eventManager_.removeAll();

    if (this.hls_) {
      this.hls_.destroy();
      this.hls_ = null;
    }
  }

  private createHls_() {
    const hls = new Hls();

    const listen = this.eventManager_.listen(hls);

    listen(Hls.Events.INTERSTITIAL_STARTED, () => {
      this.assetMediaIndex_ = 0;
    });

    listen(Hls.Events.INTERSTITIAL_ASSET_STARTED, (_, data) => {
      const media = this.claimMedia_(false);
      data.player.attachMedia(media);
    });

    listen(Hls.Events.INTERSTITIALS_PRIMARY_RESUMED, () => {
      this.claimMedia_(true);
    });

    return hls;
  }

  private claimMedia_(primary: boolean) {
    let media = this.primaryMedia_;

    if (!primary) {
      const idx = this.assetMediaIndex_;
      media = this.assetMedias_[idx];
      this.assetMediaIndex_ = (idx + 1) % this.assetMedias_.length;
    }

    this.setActiveMedia_(media);

    return media;
  }

  private setActiveMedia_(media: HTMLMediaElement) {
    this.allMedias_.forEach((element) => {
      element.style.opacity = element === media ? "1" : "0";
    });

    this.activeMedia_ = media;
  }

  private get allMedias_() {
    return [this.primaryMedia_, ...this.assetMedias_];
  }

  private addMediaListeners_(media: HTMLMediaElement) {
    const listen = this.eventManager_.listen(media);

    const isActive = () => this.activeMedia_ === media;

    listen("canplay", () => {
      this.state_?.setReady();
    });

    listen("playing", () => {
      this.state_?.setStarted();
      if (isActive()) {
        this.state_?.setPlayhead("playing");
      }
    });

    listen("pause", () => {
      if (isActive()) {
        this.state_?.setPlayhead("pause");
      }
    });
  }
}
