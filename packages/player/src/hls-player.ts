import Hls from "hls.js";
import { assert } from "shared/assert";
import { EventEmitter } from "tseep/lib/ee-safe";
import { EventManager } from "./event-manager";
import { getLangCode } from "./helpers";
import { getState, State } from "./state";
import { Events } from "./types";
import type {
  AudioTrack,
  HlsPlayerEventMap,
  Quality,
  SubtitleTrack,
  TimelineItem,
} from "./types";
import type { Level } from "hls.js";

export class HlsPlayer {
  private media_: HTMLMediaElement;

  private eventManager_ = new EventManager();

  private hls_: Hls | null = null;

  private state_: State | null = null;

  private emitter_ = new EventEmitter<HlsPlayerEventMap>();

  constructor(public container: HTMLDivElement) {
    this.media_ = this.createMedia_();
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
    this.unload();

    this.bindMediaListeners_();
    const hls = this.createHls_();

    this.state_ = new State({
      onEvent: (event: Events) => this.emit_(event),
      getTiming: () => hls.interstitialsManager?.integrated,
      getInterstitialTiming: () => hls.interstitialsManager?.bufferingPlayer,
    });

    hls.attachMedia(this.media_);
    hls.loadSource(url);

    this.hls_ = hls;
  }

  unload() {
    this.eventManager_.removeAll();
    this.state_ = null;

    if (this.hls_) {
      this.hls_.destroy();
      this.hls_ = null;
    }

    this.emit_(Events.RESET);
  }

  destroy() {
    this.emitter_.removeAllListeners();
    this.unload();
  }

  on = this.emitter_.on.bind(this.emitter_);
  off = this.emitter_.off.bind(this.emitter_);
  once = this.emitter_.once.bind(this.emitter_);

  playOrPause() {
    if (!this.state_) {
      return;
    }
    const shouldPause =
      this.state_.playhead === "play" || this.state_.playhead === "playing";
    if (shouldPause) {
      this.media_.pause();
    } else {
      this.media_.play();
    }
  }

  seekTo(time: number) {
    assert(this.hls_);

    this.hls_.interstitialsManager?.integrated.seekTo(time);
  }

  setQuality(height: number | null) {
    assert(this.hls_);

    if (height === null) {
      this.hls_.nextLevel = -1;
    } else {
      const loadLevel = this.hls_.levels[this.hls_.loadLevel];
      assert(loadLevel, "No level found for loadLevel index");

      const idx = this.hls_.levels.findIndex((level) => {
        return (
          level.height === height &&
          level.audioCodec?.substring(0, 4) ===
            loadLevel.audioCodec?.substring(0, 4)
        );
      });

      if (idx < 0) {
        throw new Error("Could not find matching level");
      }

      this.hls_.nextLevel = idx;
    }

    this.updateQualities_();
  }

  setAudioTrack(id: number) {
    assert(this.hls_);

    const audioTrack = this.state_?.audioTracks.find(
      (track) => track.id === id,
    );
    assert(audioTrack);

    this.hls_.setAudioOption({
      lang: audioTrack.track.lang,
      channels: audioTrack.track.channels,
      name: audioTrack.track.name,
    });
  }

  setSubtitleTrack(id: number | null) {
    assert(this.hls_);

    if (id === null) {
      this.hls_.subtitleTrack = -1;
      return;
    }

    const subtitleTrack = this.state_?.subtitleTracks.find(
      (track) => track.id === id,
    );
    assert(subtitleTrack);

    this.hls_.setSubtitleOption({
      lang: subtitleTrack.track.lang,
      name: subtitleTrack.track.name,
    });
  }

  setVolume(volume: number) {
    this.media_.volume = volume;
    this.media_.muted = volume === 0;
    this.state_?.setVolume(volume);
  }

  get unstable_hlsjsVersion() {
    return Hls.version;
  }

  get ready() {
    return getState(this.state_, "ready");
  }

  get playhead() {
    return getState(this.state_, "playhead");
  }

  get started() {
    return getState(this.state_, "started");
  }

  get currentTime() {
    return getState(this.state_, "currentTime");
  }

  get duration() {
    return getState(this.state_, "duration");
  }

  get seeking() {
    return getState(this.state_, "seeking");
  }

  get qualities() {
    return getState(this.state_, "qualities");
  }

  get autoQuality() {
    return getState(this.state_, "autoQuality");
  }

  get audioTracks() {
    return getState(this.state_, "audioTracks");
  }

  get subtitleTracks() {
    return getState(this.state_, "subtitleTracks");
  }

  get volume() {
    return getState(this.state_, "volume");
  }

  get seekableStart() {
    return getState(this.state_, "seekableStart");
  }

  get live() {
    return getState(this.state_, "live");
  }

  get timeline() {
    return getState(this.state_, "timeline");
  }

  get interstitial() {
    return getState(this.state_, "interstitial");
  }

  private createHls_() {
    const hls = new Hls();

    const listen = this.eventManager_.listen(hls);

    listen(Hls.Events.MANIFEST_LOADED, () => {
      this.updateQualities_();
      this.updateAudioTracks_();
      this.updateSubtitleTracks_();
    });

    listen(Hls.Events.LEVELS_UPDATED, () => {
      this.updateQualities_();
    });

    listen(Hls.Events.LEVEL_SWITCHING, () => {
      this.updateQualities_();
    });

    listen(Hls.Events.AUDIO_TRACKS_UPDATED, () => {
      this.updateAudioTracks_();
    });

    listen(Hls.Events.AUDIO_TRACK_SWITCHING, () => {
      this.updateAudioTracks_();
    });

    listen(Hls.Events.SUBTITLE_TRACKS_UPDATED, () => {
      this.updateSubtitleTracks_();
    });

    listen(Hls.Events.SUBTITLE_TRACK_SWITCH, () => {
      this.updateSubtitleTracks_();
    });

    listen(Hls.Events.INTERSTITIALS_UPDATED, (_, data) => {
      const timeline = data.schedule.reduce<TimelineItem[]>((acc, item) => {
        if (!item.event) {
          return acc;
        }

        acc.push({
          start: item.integrated.start,
          duration: item.integrated.end - item.integrated.start,
          plannedDuration: item.event.dateRange.plannedDuration ?? undefined,
        });

        return acc;
      }, []);
      this.state_?.setTimeline(timeline);
    });

    listen(Hls.Events.INTERSTITIAL_STARTED, () => {
      this.state_?.setInterstitial({});
    });

    listen(Hls.Events.INTERSTITIAL_ENDED, () => {
      this.state_?.setInterstitial(null);
    });

    return hls;
  }

  private updateQualities_() {
    assert(this.hls_);

    const group: {
      height: number;
      levels: Level[];
    }[] = [];

    for (const level of this.hls_.levels) {
      let item = group.find((item) => item.height === level.height);
      if (!item) {
        item = {
          height: level.height,
          levels: [],
        };
        group.push(item);
      }
      item.levels.push(level);
    }

    const level = this.hls_.levels[this.hls_.nextLoadLevel];

    const qualities = group.map<Quality>((item) => {
      return {
        ...item,
        active: item.height === level.height,
      };
    });

    qualities.sort((a, b) => b.height - a.height);

    const autoQuality = this.hls_.autoLevelEnabled;
    this.state_?.setQualities(qualities, autoQuality);
  }

  private updateAudioTracks_() {
    assert(this.hls_);

    const tracks = this.hls_.allAudioTracks.map<AudioTrack>((track, index) => {
      let label = getLangCode(track.lang);
      if (track.channels === "6") {
        label += " 5.1";
      }
      return {
        id: index,
        active: this.hls_?.audioTracks.includes(track)
          ? track.id === this.hls_.audioTrack
          : false,
        label,
        track,
      };
    });

    this.state_?.setAudioTracks(tracks);
  }

  private updateSubtitleTracks_() {
    assert(this.hls_);

    const tracks = this.hls_.allSubtitleTracks.map<SubtitleTrack>(
      (track, index) => {
        return {
          id: index,
          active: this.hls_?.subtitleTracks.includes(track)
            ? track.id === this.hls_.subtitleTrack
            : false,
          label: getLangCode(track.lang),
          track,
        };
      },
    );

    this.state_?.setSubtitleTracks(tracks);
  }

  private bindMediaListeners_() {
    const listen = this.eventManager_.listen(this.media_);

    listen("canplay", () => {
      const live =
        this.hls_?.levels[this.hls_.currentLevel]?.details?.live ?? false;
      this.state_?.setReady(live);
    });

    listen("play", () => {
      this.state_?.setPlayhead("play");
    });

    listen("playing", () => {
      this.state_?.setPlayhead("playing");
    });

    listen("pause", () => {
      this.state_?.setPlayhead("pause");
    });

    listen("volumechange", () => {
      this.state_?.setVolume(this.media_.volume);
    });

    listen("seeking", () => {
      this.state_?.setSeeking(true);
    });

    listen("seeked", () => {
      this.state_?.setSeeking(false);
    });
  }

  private emit_(event: Events) {
    this.emitter_.emit(event);
    this.emitter_.emit("*", event);
  }
}
