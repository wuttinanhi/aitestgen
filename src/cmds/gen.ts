import path from "path";
import { fileExists, readFileString, writeFileString } from "src/helpers/files.ts";
import { parseTestPrompt } from "src/testprompt/parser.ts";
import { DEFAULT_PUPPETEER_TEMPLATE, PuppeteerTranslator } from "../translators/index.ts";
import { formatTSCode } from "../helpers/formatter.ts";
import { TestStepGenerator } from "../generators/generator.ts";
import { DEFAULT_SYSTEM_FINALIZE_PROMPT, DEFAULT_SYSTEM_INSTRUCTION_PROMPT } from "../prompts/index.ts";
import { BaseMessage } from "@langchain/core/messages";
import { PuppeteerController } from "../controllers/puppeteer.controller.ts";
import { parseModel } from "../models/wrapper.ts";
import { AIModel } from "../models/types.ts";
import { PuppeteerTestsuiteGenerator, TestsuiteTestcaseObject } from "../testsuites/puppeteer.testsuite.ts";
import { Testcase } from "../testprompt/types.ts";
import { createCommand } from "commander";
import { addGenericOptions } from "./options.ts";

export function makeGenCommand() {
  const genCommand = createCommand("gen")
    .description("Generate test from test prompt file")
    .option("-f, --file <path>", "Specify test prompt file path", "");

  addGenericOptions(genCommand);

  return genCommand;
}

export async function runGenMode(args: string[], options: any) {
  const testPromptPath = options.file;

  if (testPromptPath === "") {
    console.log(`No test prompt file specified use "-f, --file" to specify`);
    process.exit(1);
  }

  const fileFound = await fileExists(testPromptPath);
  if (!fileFound) {
    console.error("File not found", testPromptPath);
    process.exit(1);
  }

  console.log("Using test prompt file:", testPromptPath);

  const testPromptString = await readFileString(testPromptPath);
  const testPrompt = parseTestPrompt(testPromptString);

  const testsuiteName = testPrompt.testsuite.name;

  const model = parseModel(options);

  const testsuiteTestcases: TestsuiteTestcaseObject[] = [];

  if (Array.isArray(testPrompt.testsuite.testcases.testcase)) {
    let i = 0;
    for (const testcase of testPrompt.testsuite.testcases.testcase) {
      console.log("\n\nTestcase name:", testcase.name);

      const genSteps = await testGenWorker(model, testcase.name, testcase.prompt);

      // append result to array
      testsuiteTestcases.push({
        testcaseName: testcase.name,
        steps: genSteps,
      });

      i++;
    }
  } else {
    // single object
    const testcaseName = (testPrompt.testsuite.testcases.testcase as unknown as Testcase).name;
    const testcasePrompt = (testPrompt.testsuite.testcases.testcase as unknown as Testcase).prompt;
    const genSteps = await testGenWorker(model, testcaseName, testcasePrompt);

    // append result to array
    testsuiteTestcases.push({
      testcaseName: testcaseName,
      steps: genSteps,
    });
  }

  // new puppeteer testsuite generator
  const testsuiteGen = new PuppeteerTestsuiteGenerator(DEFAULT_PUPPETEER_TEMPLATE, {
    placeolderTestsuiteName: "// {{TESTSUITE_NAME}}",
    placeholderTestcasesCode: "// {{TESTCASES}}",
    templateTestcaseStart: "// --- START TESTCASE ---",
    templateTestcaseEnd: "// --- END TESTCASE ---",
    placeholderTestcaseName: "// {{TESTCASE_NAME}}",
    placeholderTestcaseStepCode: "// {{TESTCASE_GENERATED_CODE}}",
  });

  // generate complete testsuite code
  const testsuiteCode = await testsuiteGen.generate(testsuiteName, testsuiteTestcases);

  const outputPath = testPrompt.testsuite.output;

  let formattedCode: string;
  try {
    // format testsuite code
    formattedCode = await formatTSCode(testsuiteCode);
    await writeFileString(outputPath, formattedCode);
  } catch (_) {
    console.error("Failed to format testsuite code");
    await writeFileString(outputPath, testsuiteCode);
  }

  console.log("Testsuite output paht:", outputPath);

  process.exit(0);
}

async function testGenWorker(model: AIModel, name: string, prompt: string) {
  const messageBuffer: Array<BaseMessage> = [];

  // new web controller
  const webController = new PuppeteerController();
  webController.setHeadless(false);

  // new test step generator
  const stepGen = new TestStepGenerator(model, webController, DEFAULT_SYSTEM_INSTRUCTION_PROMPT, DEFAULT_SYSTEM_FINALIZE_PROMPT);
  stepGen.setVerbose(true);

  // generate steps
  const finalizedSteps = await stepGen.generate(prompt, messageBuffer);

  return finalizedSteps;
}
