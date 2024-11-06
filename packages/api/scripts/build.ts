import { $ } from "bun";

await $`bun run tsup`;
await $`bun build ./src/index.ts --target=bun --outdir=./dist`;
await $`cp -r ./src/db/migrations ./dist`;
