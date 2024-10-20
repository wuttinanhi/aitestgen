import OpenAI from "openai";
import { testStepGen as testStepGenerator } from "./generators/generator";
import { handleFinalize } from "./handlers/finalizer";
import { readFileString, writeFileString } from "./helpers/files";
import { formatTSCode } from "./helpers/formatter";
import { PuppeteerTranslator } from "./translators/puppeteer.translator";

async function testGenWrapper() {
  const OUT_GENTEST_PATH = "generated/app.test.ts";
  const OUT_STEP_HISTORY_PATH = "generated/out.steps.json";

  // prettier-ignore
  const SYSTEM_INSTRUCTION_PROMPT = await readFileString("prompts/system_instruction_prompt.txt");
  // prettier-ignore
  const SYSTEM_FINALIZE_PROMPT = await readFileString("prompts/system_finalize_prompt.txt");
  const USER_PROMPT = await readFileString("prompts/example1.txt");
  const TEMPLATE_CODE = await readFileString("templates/puppeteer_template.ts");

  console.log("User Prompt\n", USER_PROMPT);

  const openai = new OpenAI();
  const messageBuffer: Array<OpenAI.ChatCompletionMessageParam> = [];

  try {
    const result = await testStepGenerator(
      SYSTEM_INSTRUCTION_PROMPT,
      USER_PROMPT,
      25,
      openai,
      messageBuffer
    );

    // write step history to file
    await writeFileString(
      OUT_STEP_HISTORY_PATH,
      JSON.stringify(result.stepHistory.getAll())
    );

    const finalizeSteps = await handleFinalize(
      SYSTEM_FINALIZE_PROMPT,
      openai,
      messageBuffer,
      result.stepHistory
    );
    console.log("Finalized Steps", finalizeSteps);

    const selectedSteps = result.stepHistory.pickStepByIds(finalizeSteps);

    const puppeteerTestGen = new PuppeteerTranslator(
      selectedSteps,
      TEMPLATE_CODE,
      "browser",
      "page",
      "// {{GENERATED_CODE}}"
    );

    console.log("Total Tokens used:", result.totalTokens);
    console.log("Generated test code at", OUT_GENTEST_PATH);

    try {
      // generate the test code
      let generatedTestCode = await puppeteerTestGen.generate();
      await writeFileString(OUT_GENTEST_PATH, generatedTestCode);

      // try formatting the generated code
      let formattedCode = await formatTSCode(generatedTestCode);
      await writeFileString(OUT_GENTEST_PATH, formattedCode);
    } catch (error) {
      console.error("Error generating test code", error);
    }
  } catch (error) {
    console.log("Error generating test code", error);
  } finally {
    await writeFileString(
      ".debug/messageBuffer.json",
      JSON.stringify(messageBuffer)
    );
  }
}

testGenWrapper();
