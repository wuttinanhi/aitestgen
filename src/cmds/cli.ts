import { Command } from "commander";
import path from "path";
import { createDir, fileExists, readFileString, writeFileString } from "../helpers/files.ts";
import { runGenMode } from "../modes/gen.ts";
import { runTestMode } from "../modes/test.ts";
import { parseTestPrompt } from "../testprompt/parser.ts";
import { GenCommand } from "./gen.ts";
import { TestCommand } from "./test.ts";

export async function main() {
  const program = new Command();

  program.description(`A command-line tool that leverages AI to automatically generate test cases from natural language prompts. 
This tool helps developers quickly create comprehensive test suites by describing what they want to test in plain English.`);

  const genCommand = new GenCommand();
  program.addCommand(genCommand);

  const testCommand = new TestCommand();
  program.addCommand(testCommand);

  program.parse();

  switch (program.args[0]) {
    case "gen":
      genCommand.parse();

      const testPromptPath = genCommand.opts().file;

      if (testPromptPath === "") {
        throw new Error(`No test prompt file specified (use "-f, --file" to specify)`);
      }

      const fileFound = await fileExists(testPromptPath);
      if (!fileFound) {
        throw new Error("Test prompt file not found");
      }

      const genDir = genCommand.opts().gendir;
      if (!genDir) {
        throw new Error("gendir not set");
      }

      // create gen dir
      await createDir(genDir);

      console.log("Using test prompt file:", testPromptPath);

      const testPromptString = await readFileString(testPromptPath);
      const testPromptData = parseTestPrompt(testPromptString);

      let testsuiteOutputPath = testPromptData.testsuite.output;

      let genResult = await runGenMode({
        headless: genCommand.opts().headless,
        verbose: genCommand.opts().verbose,
        genDir: genDir,
        testPrompt: testPromptData,
      });

      // save testcases steps to file
      for (const testcase of genResult.testcases) {
        const filename = String(testcase.testcase.name).replace(" ", "_").toLowerCase();
        let testcaseStepOutputPath = path.join(genDir, `${filename}.steps.json`);
        await writeFileString(testcaseStepOutputPath, JSON.stringify(testcase.steps));
        console.log("Testsuite steps saved at:", testcaseStepOutputPath);
      }

      await writeFileString(testsuiteOutputPath, genResult.testsuiteCode);
      console.log("Testsuite output paht:", testsuiteOutputPath);
      return;
    case "test":
      await runTestMode();
      return;
    default:
      console.log("Unknown args:", program.args[0]);
      process.exit(1);
  }
}
