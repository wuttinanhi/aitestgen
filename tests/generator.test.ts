import { test } from "vitest";
import { PuppeteerController } from "testgenwebcontroller";
import { modelOpenAI } from "../src/models/openai.ts";
import { BaseMessage } from "@langchain/core/messages";
import { TestStepGenerator } from "../src/generators/generator.ts";
import { DEFAULT_SYSTEM_FINALIZE_PROMPT, DEFAULT_SYSTEM_INSTRUCTION_PROMPT } from "../src/prompts/index.ts";
import { readFileString, writeFileString } from "../src/helpers/files.ts";
import { PuppeteerTranslator } from "../src/translators/puppeteer/puppeteer.translator.ts";
import { DEFAULT_PUPPETEER_TEMPLATE } from "../src/translators/index.ts";
import { formatTSCode } from "../src/helpers/formatter.ts";

test("should generate working test", async () => {
  const OUT_GENTEST_PATH = ".test/app.test.ts";
  const OUT_STEP_ALL = ".test/out.steps.json";
  const OUT_STEP_SELECTED = ".test/out.steps.selected.json";

  const USER_PROMPT = await readFileString(__dirname + "/../src/prompts/example_contact_form.txt");
  console.log("User Prompt\n", USER_PROMPT);

  const model = modelOpenAI;

  const messageBuffer: Array<BaseMessage> = [];

  const webEngine = new PuppeteerController();

  const testStepGenerator = new TestStepGenerator(
    model,
    webEngine,
    DEFAULT_SYSTEM_INSTRUCTION_PROMPT,
    DEFAULT_SYSTEM_FINALIZE_PROMPT,
  );

  const finalizedSteps = await testStepGenerator.generate(USER_PROMPT, messageBuffer);

  // write generated steps to file
  await writeFileString(OUT_STEP_ALL, JSON.stringify(testStepGenerator.getGeneratedSteps()));

  // write finalize steps to file
  await writeFileString(OUT_STEP_SELECTED, JSON.stringify(finalizedSteps));

  // new puppeteer translator
  const puppeteerTestGen = new PuppeteerTranslator(
    finalizedSteps,
    DEFAULT_PUPPETEER_TEMPLATE,
    "browser",
    "page",
    "// {{GENERATED_CODE}}",
  );

  console.log("Total Tokens used:", testStepGenerator.getTotalTokens());
  console.log("Generated test code at", OUT_GENTEST_PATH);

  // generate the test code
  let generatedTestCode = await puppeteerTestGen.generate();

  // try formatting the generated code
  let formattedCode = await formatTSCode(generatedTestCode);

  // save formatted generated test code to file
  await writeFileString(OUT_GENTEST_PATH, formattedCode);

  // write message buffer to file
  await writeFileString(".test/messageBuffer.json", JSON.stringify(messageBuffer));
});
