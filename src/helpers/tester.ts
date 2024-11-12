import { exec } from "child_process";

export interface VitestResult {
  stdout: string;
  stderror: string;
  exitCode: number;
}

export function runVitest(filePath: string): Promise<VitestResult> {
  return new Promise((resolve) => {
    exec(`vitest ${filePath}`, (error, stdout, stderror) => {
      return resolve({
        stdout,
        stderror,
        exitCode: error ? error.code || 1 : 0,
      });
    });
  });
}
