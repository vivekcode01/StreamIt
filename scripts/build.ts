import { $ } from "bun";
import { buildClientPackages } from "./devtools/client-packages";

await buildClientPackages();

await $`bun run --filter="@superstreamer/api" build`;
await $`bun run --filter="@superstreamer/app" build`;
await $`bun run --filter="@superstreamer/artisan" build`;
await $`bun run --filter="@superstreamer/stitcher" build`;
