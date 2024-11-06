import {$} from "bun";

await Promise.all([
  // Build api for the api client.
  $`bun run --filter="@superstreamer/api" build`,
  // Build player for app.
  $`bun run --filter="@superstreamer/player" build`,
])
