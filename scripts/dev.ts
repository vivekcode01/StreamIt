import { $ } from "bun";
import { buildClientPackages } from "./helpers";

await buildClientPackages();

await $`bun run --filter="@superstreamer/*" dev`;
