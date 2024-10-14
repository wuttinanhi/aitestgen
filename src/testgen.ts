import { readFileString, writeFileString } from "./helpers/files";
import { formatTSCode } from "./helpers/formatter";
import { PuppeteerTestGen } from "./testgens/puppeteer.gen";

async function testgen() {
  const OUT_STEP_PATH = "generated/out.steps.json";
  const TEMPLATE_PATH = "src/templates/puppeteer_template.ts";
  const OUT_GENTEST_PATH = "generated/app.test.ts";

  const stepOut = await readFileString(OUT_STEP_PATH);
  const stepOutJSON = JSON.parse(stepOut);
  const templateCode = await readFileString(TEMPLATE_PATH);

  const puppeteerTestGen = new PuppeteerTestGen(
    stepOutJSON,
    templateCode,
    "browser",
    "page",
    "// {{GENERATED_CODE}}"
  );

  let generatedTestCode = puppeteerTestGen.generate();
  await writeFileString(OUT_GENTEST_PATH, generatedTestCode);

  let formattedCode = await formatTSCode(generatedTestCode);
  await writeFileString(OUT_GENTEST_PATH, formattedCode);
}

testgen();
