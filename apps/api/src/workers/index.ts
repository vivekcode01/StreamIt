import { runWorkers } from "bolt";
import { outcomeCallback } from "./outcome";

runWorkers([
  {
    name: "outcome",
    callback: outcomeCallback,
  },
]);
