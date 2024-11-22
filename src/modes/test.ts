import { spawn } from "child_process";

export async function runTestMode() {
  // Run `vitest` as a child process
  const vitest = spawn("vitest", ["run"], { stdio: "inherit" });

  // Exit the current script after `vitest` is executed
  vitest.on("close", (code: any) => {
    console.log(`Vitest exited with code ${code}`);
    process.exit(code);
  });
}
