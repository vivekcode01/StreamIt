import { Job } from "@superstreamer/api/client";

export type JobsFilterData = {
  tag?: string;
  name?: string;
  state?: Job["state"];
};
