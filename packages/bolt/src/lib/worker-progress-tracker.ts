import type { Job } from "bullmq";

export class WorkerProgressTracker {
  private values_: Record<string, number> = {};

  private lastKey_?: string;

  private updating_ = false;

  constructor(private job_: Job) {}

  set(key: string, value: number) {
    if (this.lastKey_ !== key) {
      this.update_(this.lastKey_, 100);
      this.lastKey_ = key;
    }
    this.update_(key, value);
    this.persist_();
  }

  async finish() {
    if (!Object.keys(this.values_).length) {
      return;
    }
    const keys = Object.keys(this.values_);
    for (const key of keys) {
      this.values_[key] = 100;
    }
    await this.persist_();
  }

  private async persist_() {
    if (this.updating_) {
      return;
    }
    this.updating_ = true;
    await this.job_.updateProgress(this.values_);
    this.updating_ = false;
  }

  private update_(key: string | undefined, inputValue: number) {
    let value = inputValue;
    if (key === undefined) {
      return;
    }
    if (value < 0) {
      value = 0;
    }
    if (value > 100) {
      value = 100;
    }
    if (!this.values_[key]) {
      this.values_[key] = 0;
    }
    this.values_[key] = value;
  }
}
