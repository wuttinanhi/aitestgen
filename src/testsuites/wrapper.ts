import { PuppeteerTestsuiteGenerator } from "./puppeteer.testsuite.ts";
import { SeleniumTestsuiteGenerator } from "./selenium.testsuite.ts";

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
    case "selenium":
      const testsutieGen = new SeleniumTestsuiteGenerator(templateCode, {
        placeholderTestcasesCode: "// {{TESTCASES}}",
        templateTestcaseStart: "// --- START TESTCASE ---",
        templateTestcaseEnd: "// --- END TESTCASE ---",
        placeholderTestcaseStepCode: "// {{TESTCASE_GENERATED_CODE}}",
        placeholderJavaMethodName: "TESTCASE_NAME",
        placeholderJavaClassName: "CLASS_NAME_HERE",
      });

      return testsutieGen;
    default:
      throw new Error(`Testsuite generator unknown translator ${translatorName}`);
  }
}
