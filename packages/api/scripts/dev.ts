import { $ } from "bun";

await Promise.all([
  $`bun run tsup --watch`,
  $`bun --watch --inspect=ws://localhost:6499/sprs-api ./src/index.ts`,
]);
