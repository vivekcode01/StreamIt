import {$} from "bun";

import "./pre-build";

await Promise.all([
  $`bun run --filter="@superstreamer/app" build`,
  $`bun run --filter="@superstreamer/artisan" build`,
  $`bun run --filter="@superstreamer/stitcher" build`,
])