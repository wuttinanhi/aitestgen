import { spawn } from "child_process";

import { createCommand } from "commander";

export function makeTestCommand() {
  const testCommand = createCommand("test").description("Test generated code using vitest");

  return testCommand;
}

export function runTestMode() {
  // Run `vitest` as a child process
  const vitest = spawn("vitest", ["run"], { stdio: "inherit" });

  // Exit the current script after `vitest` is executed
  vitest.on("close", (code: any) => {
    console.log(`Vitest exited with code ${code}`);
    process.exit(code);
  });
}
