import type { Playhead } from "./types";

interface StateParams {
  getTiming(): null | [number, number];
}

export class State {
  playhead: Playhead = "idle";

  ready = false;

  started = false;

  private timerId_: number | undefined;

  constructor(private params_: StateParams) {
    this.requestTimingSync();
  }

  setReady() {
    if (this.ready) {
      return;
    }
    this.ready = true;
    this.requestTimingSync();
  }

  setPlayhead(playhead: Playhead) {
    if (playhead === this.playhead) {
      return;
    }
    this.playhead = playhead;
  }

  setStarted() {
    if (this.started) {
      return;
    }
    this.started = true;
  }

  requestTimingSync() {
    clearTimeout(this.timerId_);
    this.timerId_ = window.setTimeout(() => {
      this.requestTimingSync();
    }, 250);

    const timing = this.params_.getTiming();
    if (!timing) {
      return;
    }

    const [time, duration] = timing;
    console.log(time, duration);
  }
}
