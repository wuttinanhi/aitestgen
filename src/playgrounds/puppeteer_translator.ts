import { readFileString, writeFileString } from "../helpers/files";
import { formatTSCode } from "../helpers/formatter";
import { StepHistory } from "../steps/stephistory";
import { PuppeteerTranslator } from "../translators/puppeteer/puppeteer.translator";

async function testGenerator() {
  const IN_STEPS = "generated/out.steps.selected.json";
  const OUT_GENTEST = "generated/app.test.ts";

  const stepHistoryString = await readFileString(IN_STEPS);

  const TEMPLATE_CODE = await readFileString("templates/puppeteer_template.ts");

  const stepHistory = new StepHistory();
  stepHistory.fromJSONString(stepHistoryString);

  const puppeteerTestGen = new PuppeteerTranslator(
    stepHistory.getAll(),
    TEMPLATE_CODE,
    "browser",
    "page",
    "// {{GENERATED_CODE}}",
  );

  try {
    // generate the test code
    let generatedTestCode = await puppeteerTestGen.generate();
    await writeFileString(OUT_GENTEST, generatedTestCode);

    // try formatting the generated code
    let formattedCode = await formatTSCode(generatedTestCode);
    await writeFileString(OUT_GENTEST, formattedCode);
  } catch (error) {
    console.error("Error generating test code", error);
  }
}

testGenerator();
