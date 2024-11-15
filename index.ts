#!/usr/bin/env npx tsx

import { main } from "./src/cmds/testgen.ts";

// disable node `module` warning
// (node:15327) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
// (Use `node --trace-deprecation ...` to show where the warning was created)
process.removeAllListeners("warning");

main();
