import { readFileString, writeFileString } from "./helpers/files";
import { formatTSCode } from "./helpers/formatter";
import { StepHistory } from "./steps/stephistory";
import { PuppeteerTestGen } from "./testgens/puppeteer.gen";

async function testgen() {
  const OUT_STEP_PATH = "generated/out.steps.json";
  const TEMPLATE_PATH = "src/templates/puppeteer_template.ts";
  const OUT_GENTEST_PATH = "generated/app.test.ts";

  const stepOut = await readFileString(OUT_STEP_PATH);
  const templateCode = await readFileString(TEMPLATE_PATH);

  const stepHistory = new StepHistory();
  stepHistory.fromJSONString(stepOut);

  const puppeteerTestGen = new PuppeteerTestGen(
    stepHistory,
    templateCode,
    "browser",
    "page",
    "// {{GENERATED_CODE}}"
  );

  // generate the test code
  let generatedTestCode = puppeteerTestGen.generate();
  await writeFileString(OUT_GENTEST_PATH, generatedTestCode);

  console.log("Generated test code at", OUT_GENTEST_PATH);

  // try formatting the generated code
  let formattedCode = await formatTSCode(generatedTestCode);
  await writeFileString(OUT_GENTEST_PATH, formattedCode);
}

testgen();
