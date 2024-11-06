import { $ } from "bun";

await Promise.all([
  $`bun run tsup`,
  $`bun build ./src/index.ts --target=bun --outdir=./dist`,
]);

await $`cp -r ./src/db/migrations ./dist`;
