import { BaseMessage } from "@langchain/core/messages";
import ora from "ora";
import path from "path";
import { PuppeteerController } from "../controllers/puppeteer.controller.ts";
import { TestStepGenerator } from "../generators/generator.ts";
import { createDir, writeFileString } from "../helpers/files.ts";
import { formatTSCode } from "../helpers/formatter.ts";
import { AIModel } from "../models/types.ts";
import { getOllamaModel, getOpenAIModel, parseModel } from "../models/wrapper.ts";
import { DEFAULT_SYSTEM_FINALIZE_PROMPT, DEFAULT_SYSTEM_INSTRUCTION_PROMPT } from "../prompts/index.ts";
import { DEFAULT_PUPPETEER_TEMPLATE, PuppeteerTranslator } from "../translators/index.ts";

export async function runPromptMode(args: string[], options: any) {
  const OUT_GEN_DIR = options.gendir;
  const OUT_GENTEST_PATH = options.out;
  const OUT_STEP_ALL = path.join(OUT_GEN_DIR, "steps.all.json");
  const OUT_STEP_FINALIZED = path.join(OUT_GEN_DIR, "steps.finalized.json");
  const OUT_MESSAGE_BUFFER = path.join(OUT_GEN_DIR, "messages.json");

  const USER_PROMPT_TEXT = args.join(" "); // Join args into a single sentence

  if (!USER_PROMPT_TEXT) {
    console.error("User prompt not found. please run `aitestgen <YOUR PROMPT HERE>`");
    return;
  }

  console.log("💬  User Prompt:", USER_PROMPT_TEXT);

  // create gen directory
  await createDir(OUT_GEN_DIR);

  const model = parseModel(options);

  const messageBuffer: Array<BaseMessage> = [];
  const webController = new PuppeteerController();

  // set webController headless mode from cli options
  const parsedHeadless = String(options.headless).toLowerCase() === "true";

  if (parsedHeadless === false) {
    console.log("Running with headless mode:", parsedHeadless);
  }
  webController.setHeadless(parsedHeadless);

  const spinner = ora({
    // enable ctrl + c for cancel
    // https://github.com/sindresorhus/ora/issues/156
    hideCursor: false,
    discardStdin: false,
    text: `Generating test...\n`,
  });

  if (!options.verbose) {
    spinner.start();
  }

  // create new test step generator
  const testStepGenerator = new TestStepGenerator(model, webController, DEFAULT_SYSTEM_INSTRUCTION_PROMPT, DEFAULT_SYSTEM_FINALIZE_PROMPT);
  testStepGenerator.setVerbose(options.verbose);

  // generate steps
  const finalizedSteps = await testStepGenerator.generate(USER_PROMPT_TEXT, messageBuffer);

  // write generated steps to file
  await writeFileString(OUT_STEP_ALL, JSON.stringify(testStepGenerator.getGeneratedSteps()));
  // write finalize steps to file
  await writeFileString(OUT_STEP_FINALIZED, JSON.stringify(finalizedSteps));

  // new puppeteer translator
  const puppeteerTestGen = new PuppeteerTranslator("browser", "page");
  // generate the test code
  let generatedTestCode = await puppeteerTestGen.generate(finalizedSteps);

  let replacedCode = DEFAULT_PUPPETEER_TEMPLATE.replace("// {{TESTCASE_GENERATED_CODE}}", generatedTestCode);

  try {
    // try formatting the generated test code
    let formattedCode = await formatTSCode(replacedCode);
    // save formatted generated test code to file
    await writeFileString(OUT_GENTEST_PATH, formattedCode);
  } catch (error) {
    console.error("failed to format generated test code");
    await writeFileString(OUT_GENTEST_PATH, replacedCode);
  }

  // write message buffer to file
  await writeFileString(OUT_MESSAGE_BUFFER, JSON.stringify(messageBuffer));

  spinner.text = "Completed!\n";
  spinner.stop();

  console.log("Total Tokens used:", testStepGenerator.getTotalTokens());
  console.log("💾  Generated test code saved at:", OUT_GENTEST_PATH);

  process.exit(0);
}
