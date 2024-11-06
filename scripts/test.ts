import {$} from "bun";

import "./pre-build";

await $`bun run --filter="*" test`;