import { readFileString, writeFileString } from "../helpers/files.ts";
import { formatTSCode } from "../helpers/formatter.ts";
import { StepHistory } from "../stephistory/stephistory.ts";
import { DEFAULT_PUPPETEER_TEMPLATE, PuppeteerTranslator } from "../translators/index.ts";

async function main() {
  const INPUT_STEP_JSON_PATH = ".test/out.steps.selected.json";
  const OUTPUT_GENTEST_PATH = ".test/app.test.ts";

  const stepJSON = await readFileString(INPUT_STEP_JSON_PATH);

  const stepHistory = new StepHistory();
  stepHistory.fromJSONString(stepJSON);

  // new puppeteer translator
  const puppeteerTestGen = new PuppeteerTranslator(
    stepHistory.getAll(),
    DEFAULT_PUPPETEER_TEMPLATE,
    "browser",
    "page",
    "// {{GENERATED_CODE}}",
  );

  // generate the test code
  let generatedTestCode = await puppeteerTestGen.generate();

  // try formatting the generated code
  let formattedCode = await formatTSCode(generatedTestCode);

  // save formatted generated test code to file
  await writeFileString(OUTPUT_GENTEST_PATH, formattedCode);

  console.log(`Step translation saved at: ${OUTPUT_GENTEST_PATH}`);
}

main();
