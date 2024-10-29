import { OpenAI } from "openai";
import { test } from "vitest";
import { handleFinalize } from "../src/handlers/finalizer.js";
import { readFileString, writeFileString } from "../src/helpers/files.js";
import { formatTSCode } from "../src/helpers/formatter.js";
import { TestStepGenerator } from "../src/steps/generator.js";
import { PuppeteerTranslator } from "../src/translators/puppeteer.translator.js";

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

  const openai = new OpenAI();
  const messageBuffer: Array<OpenAI.ChatCompletionMessageParam> = [];
  let TOTAL_TOKEN_USED = 0;

  const testStepGenerator = new TestStepGenerator(openai, SYSTEM_INSTRUCTION_PROMPT);

  const result = await testStepGenerator.generate(USER_PROMPT, messageBuffer);
  TOTAL_TOKEN_USED += result.getTotalTokens();

  // write step history to file
  await writeFileString(OUT_STEP_ALL, JSON.stringify(result.getStepHistory().getAll()));

  const finalizeResult = await handleFinalize(SYSTEM_FINALIZE_PROMPT, openai, messageBuffer, result.getStepHistory());

  const selectedSteps = result.getStepHistory().pickStepByIds(finalizeResult.selectedSteps);
  TOTAL_TOKEN_USED += finalizeResult.totalTokens;

  // write step history to file
  await writeFileString(OUT_STEP_SELECTED, JSON.stringify(selectedSteps));

  const puppeteerTestGen = new PuppeteerTranslator(
    selectedSteps,
    TEMPLATE_CODE,
    "browser",
    "page",
    "// {{GENERATED_CODE}}",
  );

  console.log("Total Tokens used:", TOTAL_TOKEN_USED);
  console.log("Generated test code at", OUT_GENTEST_PATH);

  // generate the test code
  let generatedTestCode = await puppeteerTestGen.generate();

  // try formatting the generated code
  let formattedCode = await formatTSCode(generatedTestCode);
  await writeFileString(OUT_GENTEST_PATH, formattedCode);

  // write message buffer to file
  await writeFileString(".test/messageBuffer.json", JSON.stringify(messageBuffer));
});
