import { PuppeteerTestsuiteGenerator } from "./puppeteer.testsuite.ts";

export function getTestsuiteGeneratorByTranslator(translatorName: string, templateCode: string) {
  switch (translatorName) {
    case "puppeteer":
      const testsuiteGen = new PuppeteerTestsuiteGenerator(templateCode, {
        placeolderTestsuiteName: "// {{TESTSUITE_NAME}}",
        placeholderTestcasesCode: "// {{TESTCASES}}",
        templateTestcaseStart: "// --- START TESTCASE ---",
        templateTestcaseEnd: "// --- END TESTCASE ---",
        placeholderTestcaseName: "// {{TESTCASE_NAME}}",
        placeholderTestcaseStepCode: "// {{TESTCASE_GENERATED_CODE}}",
      });

      return testsuiteGen;
    default:
      throw new Error(`Testsuite generator unknown translator ${translatorName}`);
  }
}
