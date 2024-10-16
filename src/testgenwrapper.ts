import { testStepGen as testStepGenerator } from "./generators/generator";
import { readFileString, writeFileString } from "./helpers/files";
import { formatTSCode } from "./helpers/formatter";
import { PuppeteerTestTranslator } from "./translators/puppeteer.gen";

async function testGenWrapper() {
  // prettier-ignore
  const SYSTEM_INSTRUCTION_PROMPT = await readFileString("prompts/instruction.txt");
  const USER_PROMPT = await readFileString("prompts/example1.txt");

  const TEMPLATE_PATH = "src/templates/puppeteer_template.ts";
  const TEMPLATE_CODE = await readFileString(TEMPLATE_PATH);
  const OUT_GENTEST_PATH = "generated/app.test.ts";

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

  // generate the test code
  let generatedTestCode = puppeteerTestGen.generate();
  await writeFileString(OUT_GENTEST_PATH, generatedTestCode);

  // try formatting the generated code
  let formattedCode = await formatTSCode(generatedTestCode);
  await writeFileString(OUT_GENTEST_PATH, formattedCode);

  console.log("Total Tokens used:", result.totalTokens);
  console.log("Generated test code at", OUT_GENTEST_PATH);
}

testGenWrapper();
