import { BaseMessage } from "@langchain/core/messages";
import { Step } from "../interfaces/step.ts";
import { Testcase } from "../interfaces/testprompt.ts";
import { PuppeteerTranslator } from "../translators/puppeteer/puppeteer.translator.ts";
import { TestsuiteTestcaseObject } from "../interfaces/testsuite.ts";

export interface PuppeteerTestsuiteGeneratorOptions {
  placeolderTestsuiteName: string; // {{TESTSUITE_NAME}}
  placeholderTestcasesCode: string; // {{TESTCASES}}
  templateTestcaseStart: string; // --- START TESTCASE ---
  templateTestcaseEnd: string; // --- END TESTCASE ---
  placeholderTestcaseName: string; // {{TESTCASE_NAME}}
  placeholderTestcaseStepCode: string; // {{TESTCASE_GENERATED_CODE}}
}

export class PuppeteerTestsuiteGenerator {
  private templateTestsuite: string;
  private templateTestcase: string;
  private options: PuppeteerTestsuiteGeneratorOptions;

  constructor(template: string, options: PuppeteerTestsuiteGeneratorOptions) {
    this.templateTestsuite = template;
    this.options = options;

    const extractedTestcaseTemplate = this.extractedTestcaseTemplate(options.templateTestcaseStart, options.templateTestcaseEnd, template);
    if (!extractedTestcaseTemplate) {
      throw new Error(`Can't extract testcase template got: ${extractedTestcaseTemplate}`);
    }

    this.templateTestcase = extractedTestcaseTemplate.extracted;
    this.templateTestsuite = extractedTestcaseTemplate.modifiedTemplate;
  }

  public async generate(testsuiteName: string, testcases: TestsuiteTestcaseObject[]) {
    let generatedTestcasesCode = "";

    const testcaseTranslator = new PuppeteerTranslator();

    for (const testcase of testcases) {
      // generate test code from steps
      const generatedCode = await testcaseTranslator.generate(testcase.finalizedSteps);

      // replace `// {{TESTCASE_NAME}}` with testcase name
      let buffer = this.templateTestcase.replace(this.options.placeholderTestcaseName, testcase.testcase.name);

      // replace `// {{TESTCASE_GENERATED_CODE}}` with generated code
      buffer = buffer.replace(this.options.placeholderTestcaseStepCode, generatedCode);

      // add code to buffer
      generatedTestcasesCode += buffer;
    }

    // replace `// {{TESTSUITE_NAME}}` with testsuite name
    let testsuiteCode = this.templateTestsuite.replace(this.options.placeolderTestsuiteName, testsuiteName);

    // replace `// {{TESTCASES}}` with generated testcases code
    testsuiteCode = testsuiteCode.replace(this.options.placeholderTestcasesCode, generatedTestcasesCode);

    return testsuiteCode;
  }

  protected extractedTestcaseTemplate(
    startMarker: string,
    endMarker: string,
    template: string,
  ): { extracted: string; modifiedTemplate: string } | null {
    const startIndex = template.indexOf(startMarker) + startMarker.length;
    const endIndex = template.indexOf(endMarker);

    if (startIndex > -1 && endIndex > startIndex) {
      const extracted = template.slice(startIndex, endIndex).trim();
      const modifiedTemplate = template.slice(0, startIndex - startMarker.length).trim() + "\n" + template.slice(endIndex + endMarker.length).trim();

      return { extracted, modifiedTemplate };
    }

    return null;
  }
}
