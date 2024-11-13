import { $ } from "bun";
import { buildClientPackages } from "./devtools/client-packages";

await buildClientPackages();

await $`bun run --filter="*" test`;
