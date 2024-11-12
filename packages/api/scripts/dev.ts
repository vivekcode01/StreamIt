import { $ } from "bun";

await Promise.all([
  $`tsup`,
  $`bun --watch --inspect=ws://localhost:6499/sprs-api ./src/index.ts`,
]);
