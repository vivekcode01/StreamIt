import { assert } from "shared/assert";
import { preciseFloat } from "./helpers";
import { Events } from "./types";
import type {
  AudioTrack,
  Interstitial,
  Playhead,
  Quality,
  SubtitleTrack,
  TimelineItem,
} from "./types";

interface Timing {
  currentTime: number;
  duration: number;
  seekableStart: number;
}

interface StateParams {
  onEvent(event: Events): void;
  getTiming(): undefined | Timing | null;
  getInterstitialTiming(): undefined | Omit<Timing, "seekableStart"> | null;
}

interface StateProperties {
  ready: boolean;
  playhead: Playhead;
  started: boolean;
  seekableStart: number;
  currentTime: number;
  duration: number;
  qualities: Quality[];
  autoQuality: boolean;
  audioTracks: AudioTrack[];
  subtitleTracks: SubtitleTrack[];
  volume: number;
  seeking: boolean;
  live: boolean;
  timeline: TimelineItem[];
  interstitial: Interstitial | null;
}

const noState: StateProperties = {
  playhead: "idle",
  ready: false,
  started: false,
  seekableStart: 0,
  currentTime: 0,
  duration: NaN,
  qualities: [],
  autoQuality: false,
  audioTracks: [],
  subtitleTracks: [],
  volume: 1,
  seeking: false,
  live: false,
  timeline: [],
  interstitial: null,
};

export class State implements StateProperties {
  private timerId_: number | undefined;

  constructor(private params_: StateParams) {
    this.requestTimingSync();
  }

  setReady(live: boolean) {
    if (this.ready) {
      return;
    }
    this.live = live;
    this.ready = true;
    this.requestTimingSync();
    this.params_.onEvent(Events.READY);
  }

  setPlayhead(playhead: Playhead) {
    if (playhead === this.playhead) {
      return;
    }

    this.playhead = playhead;

    if (playhead === "pause") {
      this.requestTimingSync();
    }

    if (playhead === "playing" && !this.started) {
      this.started = true;
      this.params_.onEvent(Events.STARTED);
    }

    this.params_.onEvent(Events.PLAYHEAD_CHANGE);
  }

  setQualities(qualities: Quality[], autoQuality: boolean) {
    const diff = (items: Quality[]) =>
      items.find((item) => item.active)?.height;

    if (diff(this.qualities) !== diff(qualities)) {
      this.qualities = qualities;
      this.params_.onEvent(Events.QUALITIES_CHANGE);
    }

    if (autoQuality !== this.autoQuality) {
      this.autoQuality = autoQuality;
      this.params_.onEvent(Events.AUTO_QUALITY_CHANGE);
    }
  }

  setAudioTracks(audioTracks: AudioTrack[]) {
    const diff = (items: AudioTrack[]) => items.find((item) => item.active)?.id;

    if (diff(this.audioTracks) !== diff(audioTracks)) {
      this.audioTracks = audioTracks;
      this.params_.onEvent(Events.AUDIO_TRACKS_CHANGE);
    }
  }

  setSubtitleTracks(subtitleTracks: SubtitleTrack[]) {
    const diff = (items: AudioTrack[]) => items.find((item) => item.active)?.id;

    if (
      // TODO: Come up with a generic logical check.
      !this.subtitleTracks.length ||
      subtitleTracks.length ||
      diff(this.subtitleTracks) !== diff(subtitleTracks)
    ) {
      this.subtitleTracks = subtitleTracks;
      this.params_.onEvent(Events.SUBTITLE_TRACKS_CHANGE);
    }
  }

  setVolume(volume: number) {
    if (volume === this.volume) {
      return;
    }
    this.volume = volume;
    this.params_.onEvent(Events.VOLUME_CHANGE);
  }

  setSeeking(seeking: boolean) {
    if (seeking === this.seeking) {
      return;
    }
    this.seeking = seeking;
    this.requestTimingSync();
    this.params_.onEvent(Events.SEEKING_CHANGE);
  }

  setTimeline(timeline: TimelineItem[]) {
    this.timeline = timeline;
    this.params_.onEvent(Events.TIMELINE_CHANGE);
  }

  setInterstitial(
    interstitial: Omit<Interstitial, "currentTime" | "duration"> | null,
  ) {
    if (interstitial) {
      this.setSeeking(false);
    }

    this.interstitial = interstitial
      ? {
          ...interstitial,
          currentTime: 0,
          duration: NaN,
        }
      : null;

    this.requestTimingSync(/* skipEvent= */ true);

    this.params_.onEvent(Events.INTERSTITIAL_CHANGE);
  }

  requestTimingSync(skipEvent?: boolean) {
    clearTimeout(this.timerId_);
    this.timerId_ = window.setTimeout(() => {
      this.requestTimingSync();
    }, 250);
    let emitEvent = false;

    const timing = this.params_.getTiming();
    if (timing) {
      const currentTime = preciseFloat(timing.currentTime);
      const duration = preciseFloat(timing.duration);
      const seekableStart = preciseFloat(timing.seekableStart);

      if (
        currentTime !== this.currentTime ||
        duration !== this.duration ||
        seekableStart !== this.seekableStart
      ) {
        emitEvent = true;
      }

      this.currentTime = currentTime;
      this.duration = duration;
      this.seekableStart = seekableStart;
    }

    const interstitialTiming = this.params_.getInterstitialTiming();
    if (interstitialTiming) {
      assert(this.interstitial);

      const currentTime = preciseFloat(interstitialTiming.currentTime);
      const duration = preciseFloat(interstitialTiming.duration);

      if (
        currentTime !== this.interstitial.currentTime ||
        duration !== this.interstitial.duration
      ) {
        emitEvent = true;
      }

      this.interstitial.currentTime = currentTime;
      this.interstitial.duration = duration;
    }

    if (!skipEvent && emitEvent) {
      this.params_.onEvent(Events.TIME_CHANGE);
    }
  }

  ready = noState.ready;
  playhead = noState.playhead;
  started = noState.started;
  seekableStart = noState.seekableStart;
  currentTime = noState.currentTime;
  duration = noState.duration;
  qualities = noState.qualities;
  autoQuality = noState.autoQuality;
  audioTracks = noState.audioTracks;
  subtitleTracks = noState.subtitleTracks;
  volume = noState.volume;
  seeking = noState.seeking;
  live = noState.live;
  timeline = noState.timeline;
  interstitial = noState.interstitial;
}

export function getState<N extends keyof StateProperties>(
  state: State | null,
  name: N,
) {
  return state?.[name] ?? noState[name];
}
