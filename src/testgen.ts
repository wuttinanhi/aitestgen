import { readFileString, writeFileString } from "./helpers/files";
import { formatTSCode } from "./helpers/formatter";
import { PuppeteerTestGen } from "./testgens/puppeteer.gen";

async function testgen() {
  const stepOut = await readFileString("generated/out.steps.json");
  const stepOutJSON = JSON.parse(stepOut);

  const templateCode = await readFileString("src/puppeteer_template.ts");

  const puppeteerTestGen = new PuppeteerTestGen(
    stepOutJSON,
    templateCode,
    "browser",
    "page"
  );

  let generatedTestCode = puppeteerTestGen.generate();
  generatedTestCode = await formatTSCode(generatedTestCode);

  await writeFileString("generated/app.test.ts", generatedTestCode);
}

testgen();
