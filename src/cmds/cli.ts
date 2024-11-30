import { Command } from "commander";
import path from "path";
import { convertLangchainBaseMessageToShareGPT } from "../helpers/converter.ts";
import { createDir, fileBaseName, fileExists, readFileString, writeFileString } from "../helpers/files.ts";
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

      const genDirOpts = genCommand.opts().gendir;
      if (!genDirOpts) {
        throw new Error("gendir not set");
      }

      // save in directory `<DATEUNIX>_<TEST PROMPT FILE BASENAME>`
      const testPromptFileBaseName = fileBaseName(testPromptPath);
      const genDir = path.join(genDirOpts, `${String(Date.now())}_${testPromptFileBaseName}`);

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

      // write gen data to json
      let testGenDataSavePath = path.join(genDir, `${testPromptFileBaseName}.json`);
      console.log("Testsuite gen data saved at:", testGenDataSavePath);
      await writeFileString(testGenDataSavePath, JSON.stringify(genResult.testcasesResult));

      // write generated code to output path
      await writeFileString(testsuiteOutputPath, genResult.testsuiteCode);
      console.log("Testsuite output paht:", testsuiteOutputPath);

      // convert to sharegpt
      const shareGPTData = genResult.testcasesResult.map((v) => {
        const messageBuffer = v.messageBuffer;
        const shareGPTMessages = convertLangchainBaseMessageToShareGPT(messageBuffer);
        return {
          testcase: v.testcase,
          sharegpt: shareGPTMessages,
        };
      });

      // write sharegpt to file
      let shareGPTSavePath = path.join(genDir, `${testPromptFileBaseName}.sharegpt.json`);
      console.log("Testsuite ShareGPT data saved at:", shareGPTSavePath);
      await writeFileString(shareGPTSavePath, JSON.stringify(shareGPTData));
      return;
    case "test":
      await runTestMode();
      return;
    default:
      console.log("Unknown args:", program.args[0]);
      process.exit(1);
  }
}
