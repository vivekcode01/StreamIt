import { Job } from "@superstreamer/api/client";

export interface JobsFilterData {
  tag?: string;
  name?: string;
  state?: Job["state"];
}
