import { $ } from "bun";
import { buildClientPackages } from "./devtools/client-packages";

await buildClientPackages();

// TODO: We need a better setup for tests.
// await $`bun run --filter="*" test`;
