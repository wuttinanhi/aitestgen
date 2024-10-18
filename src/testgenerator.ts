import { readFileString, writeFileString } from "./helpers/files";
import { StepHistory } from "./steps/stephistory";
import { PuppeteerTestTranslator } from "./translators/puppeteer.gen";

async function testGenerator() {
  const IN_STEP_HISTORY_PATH = "generated/out.steps.json";
  const OUT_GENTEST_PATH = "generated/app.test.ts";

  const stepHistoryString = await readFileString(IN_STEP_HISTORY_PATH);

  const TEMPLATE_CODE = await readFileString("templates/puppeteer_template.ts");

  const stepHistory = new StepHistory();
  stepHistory.fromJSONString(stepHistoryString);

  // console.log(stepHistory.listSteps());

  const puppeteerTestGen = new PuppeteerTestTranslator(
    stepHistory,
    TEMPLATE_CODE,
    "browser",
    "page",
    "// {{GENERATED_CODE}}"
  );

  // generate the test code
  let generatedTestCode = await puppeteerTestGen.generate();
  await writeFileString(OUT_GENTEST_PATH, generatedTestCode);

  // // try formatting the generated code
  // let formattedCode = await formatTSCode(generatedTestCode);
  // await writeFileString(OUT_GENTEST_PATH, formattedCode);
}

testGenerator();
