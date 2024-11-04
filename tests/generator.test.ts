import { BaseMessage } from "@langchain/core/messages";
import { test } from "vitest";
import { PuppeteerEngine } from "../src/engines/puppeteer";
import { readFileString, writeFileString } from "../src/helpers/files";
import { formatTSCode } from "../src/helpers/formatter";
import { modelOpenAI } from "../src/models/openai";
import { TestStepGenerator } from "../src/steps/generator";
import { PuppeteerTranslator } from "../src/translators/puppeteer.translator";

test("should generate working test", async () => {
  const OUT_GENTEST_PATH = ".test/app.test.ts";
  const OUT_STEP_ALL = ".test/out.steps.json";
  const OUT_STEP_SELECTED = ".test/out.steps.selected.json";

  // prettier-ignore
  const SYSTEM_INSTRUCTION_PROMPT = await readFileString("prompts/system_instruction_prompt.txt");
  // prettier-ignore
  const SYSTEM_FINALIZE_PROMPT = await readFileString("prompts/system_finalize_prompt.txt");

  const TEMPLATE_CODE = await readFileString("templates/puppeteer_template.ts");

  const USER_PROMPT = await readFileString("prompts/example_contact_form.txt");
  console.log("User Prompt\n", USER_PROMPT);

  const model = modelOpenAI;

  const messageBuffer: Array<BaseMessage> = [];

  const webEngine = new PuppeteerEngine();
  const testStepGenerator = new TestStepGenerator(model, webEngine, SYSTEM_INSTRUCTION_PROMPT, SYSTEM_FINALIZE_PROMPT);

  const finalizedSteps = await testStepGenerator.generate(USER_PROMPT, messageBuffer);

  // write generated steps to file
  await writeFileString(OUT_STEP_ALL, JSON.stringify(testStepGenerator.getGeneratedSteps()));

  // write finalize steps to file
  await writeFileString(OUT_STEP_SELECTED, JSON.stringify(finalizedSteps));

  const puppeteerTestGen = new PuppeteerTranslator(
    finalizedSteps,
    TEMPLATE_CODE,
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
  await writeFileString(OUT_GENTEST_PATH, formattedCode);

  // write message buffer to file
  await writeFileString(".test/messageBuffer.json", JSON.stringify(messageBuffer));
});
