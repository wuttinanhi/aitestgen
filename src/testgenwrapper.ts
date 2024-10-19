import { testStepGen as testStepGenerator } from "./generators/generator";
import { readFileString, writeFileString } from "./helpers/files";
import { formatTSCode } from "./helpers/formatter";
import { PuppeteerTestTranslator } from "./translators/puppeteer.gen";

async function testGenWrapper() {
  const OUT_GENTEST_PATH = "generated/app.test.ts";
  const OUT_STEP_HISTORY_PATH = "generated/out.steps.json";

  // prettier-ignore
  const SYSTEM_INSTRUCTION_PROMPT = await readFileString("prompts/instruction.txt");
  const USER_PROMPT = await readFileString("prompts/iframe_test.txt");
  const TEMPLATE_CODE = await readFileString("templates/puppeteer_template.ts");

  console.log("User Prompt\n", USER_PROMPT);

  const result = await testStepGenerator(
    SYSTEM_INSTRUCTION_PROMPT,
    USER_PROMPT,
    25
  );

  const puppeteerTestGen = new PuppeteerTestTranslator(
    result.stepHistory,
    TEMPLATE_CODE,
    "browser",
    "page",
    "// {{GENERATED_CODE}}"
  );

  // write step history to file
  await writeFileString(
    OUT_STEP_HISTORY_PATH,
    JSON.stringify(result.stepHistory.listSteps())
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
}

testGenWrapper();
