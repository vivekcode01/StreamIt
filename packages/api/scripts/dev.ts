import { $ } from "bun";

await Promise.all([$`tsup`, $`bun --watch ./src/index.ts`]);
