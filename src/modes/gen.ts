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

  const model = parseModel(options);

  let i = 0;
  for (const testcase of testPrompt.testsuite.testcases.testcase) {
    console.log("\t", testcase.name);
    console.log("\t", testcase.prompt);

    const generatedCode = await testGenWorker(model, testcase.name, testcase.prompt);

    await writeFileString(`gen${i}.test.ts`, generatedCode);

    i++;
  }

  process.exit(0);
}

async function testGenWorker(model: AIModel, name: string, prompt: string) {
  const messageBuffer: Array<BaseMessage> = [];

  // new web controller
  const webController = new PuppeteerController();
  webController.setHeadless(false);

  // new test step generator
  const testStepGenerator = new TestStepGenerator(model, webController, DEFAULT_SYSTEM_INSTRUCTION_PROMPT, DEFAULT_SYSTEM_FINALIZE_PROMPT);
  testStepGenerator.setVerbose(true);

  // generate steps
  const finalizedSteps = await testStepGenerator.generate(prompt, messageBuffer);

  // new puppeteer translator
  const puppeteerTestGen = new PuppeteerTranslator(finalizedSteps, DEFAULT_PUPPETEER_TEMPLATE, "browser", "page", "// {{GENERATED_CODE}}");

  // generate the test code
  let generatedTestCode = await puppeteerTestGen.generate();

  const formattedCode = formatTSCode(generatedTestCode);

  return formattedCode;
}
