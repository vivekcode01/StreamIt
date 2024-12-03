import Hls from "hls.js";
import { EventManager } from "./event-manager";

export class HlsPlayer {
  private media_: HTMLMediaElement;

  private assetMedias_: [HTMLMediaElement, HTMLMediaElement];

  private hlsMap_ = new Map<HTMLMediaElement, Hls>();

  private eventManager_ = new EventManager();

  constructor(public container: HTMLDivElement) {
    this.media_ = this.createMedia_();

    this.assetMedias_ = [this.createMedia_(), this.createMedia_()];

    this.setActiveMedia_(this.media_);
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
    const hls = new Hls();
    hls.attachMedia(this.media_);

    this.hlsMap_.set(this.media_, hls);

    this.bindListeners_(hls);

    hls.loadSource(url);
  }

  reset() {
    this.eventManager_.removeAll();

    const hls = this.hlsMap_.get(this.media_);
    if (hls) {
      hls.destroy();
      this.hlsMap_.delete(this.media_);
    }
  }

  private bindListeners_(hls: Hls) {
    const listen = this.eventManager_.listen(hls);

    listen(Hls.Events.MANIFEST_LOADED, () => {
      console.log("LOADED IT");
    });

    listen(Hls.Events.INTERSTITIAL_ASSET_PLAYER_CREATED, (event) => {});

    listen(Hls.Events.INTERSTITIAL_ASSET_STARTED, () => {});
  }

  private setActiveMedia_(media: HTMLMediaElement) {
    const allMedias = [this.media_, ...this.assetMedias_];
    allMedias.forEach((element) => {
      element.style.opacity = element === media ? "1" : "0";
    });
  }
}
