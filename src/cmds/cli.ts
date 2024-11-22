import { Command } from "commander";
import path from "path";
import { createTestStepGeneratorWithOptions, createWebControllerWithOptions } from "../helpers/cli.ts";
import { createDir, fileExists, readFileString, writeFileString } from "../helpers/files.ts";
import { formatCodeByLanguage } from "../helpers/formatter.ts";
import { parseModel } from "../models/wrapper.ts";
import { runGenMode } from "../modes/gen.ts";
import { runPromptMode } from "../modes/prompt.ts";
import { runTestMode } from "../modes/test.ts";
import { parseTestPrompt } from "../testprompt/parser.ts";
import { getTemplateByTranslatorName, getTranslator } from "../translators/index.ts";
import { GenCommand } from "./gen.ts";
import { PromptCommand } from "./prompt.ts";
import { TestCommand } from "./test.ts";

export async function main() {
  const program = new Command();

  program.description(
    `A command-line tool that leverages AI to automatically generate test cases from natural language prompts. 
This tool helps developers quickly create comprehensive test suites by describing what they want to test in plain English.`,
  );

  const promptCommand = new PromptCommand();
  program.addCommand(promptCommand);

  const genCommand = new GenCommand();
  program.addCommand(genCommand);

  const testCommand = new TestCommand();
  program.addCommand(testCommand);

  program.parse();

  switch (program.args[0]) {
    case "prompt":
      promptCommand.parse();

      const promptText = promptCommand.opts().prompt;
      if (!promptText) {
        console.error("User prompt not found. use `--prompt <YOUR PROMPT HERE>` to set prompt");
        process.exit(1);
      }
      console.log("💬 User Prompt:", promptText);

      const genDirPath = promptCommand.opts().gendir;
      const testFileOutputPath = promptCommand.opts().out;
      const generatedStepsOutputPath = path.join(genDirPath, "steps.all.json");
      const finalizedStepsOutputPath = path.join(genDirPath, "steps.finalized.json");
      const messageBufferOutputPath = path.join(genDirPath, "message.buffer.json");

      // create gen directory
      await createDir(genDirPath);

      const model = parseModel(promptCommand.opts() as any);

      const webController = createWebControllerWithOptions({ headless: promptCommand.opts().headless });

      const testStepGenerator = createTestStepGeneratorWithOptions(model, webController, { verbose: promptCommand.opts().verbose });

      const translatorName = promptCommand.opts().translator;
      const translator = getTranslator(translatorName);
      const templateCode = getTemplateByTranslatorName(translatorName);

      let promptResult = await runPromptMode({
        promptText: promptText,
        testCodeTemplate: templateCode,
        model,
        webController,
        translator,
        testStepGenerator,
      });

      let generatedCode = promptResult.generatedTestCode;

      generatedCode = templateCode.replace(`// {{TESTCASE_GENERATED_CODE}}`, generatedCode);

      try {
        // try formatting the generated test code
        generatedCode = await formatCodeByLanguage(promptCommand.opts().language, generatedCode);
        // save formatted generated test code to file
        await writeFileString(testFileOutputPath, generatedCode);
      } catch (_) {
        // error is okay. save unformatted code
        console.error("failed to format generated test code");
        await writeFileString(testFileOutputPath, generatedCode);
      }

      // write generated steps to file
      await writeFileString(generatedStepsOutputPath, JSON.stringify(promptResult.generatedSteps));

      // write finalize steps to file
      await writeFileString(finalizedStepsOutputPath, JSON.stringify(promptResult.finalizedSteps));

      // write message buffer to file
      await writeFileString(messageBufferOutputPath, JSON.stringify(promptResult.messageBuffer));

      console.log("Total Tokens used:", testStepGenerator.getTotalTokens());
      console.log("💾  Generated test code saved at:", testFileOutputPath);
      return;
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
