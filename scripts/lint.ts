import { $ } from "bun";
import { buildClientPackages } from "./misc/helpers";

await buildClientPackages();

await $`bun run --filter="*" lint`;
