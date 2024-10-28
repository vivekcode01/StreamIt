import { Job } from "@/ApiContext";

export type JobsFilterData = {
  tag?: string;
  name?: string;
  state?: Job["state"];
};
