import { spawn } from "child_process";

import { Command, createCommand } from "commander";

export class TestCommand extends Command {
  constructor() {
    super("test");
    this.description("Test generated code using vitest");
  }

  run() {
    // Run `vitest` as a child process
    const vitest = spawn("vitest", ["run"], { stdio: "inherit" });

    // Exit the current script after `vitest` is executed
    vitest.on("close", (code: any) => {
      console.log(`Vitest exited with code ${code}`);
      process.exit(code);
    });
  }
}
