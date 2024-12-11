import { PuppeteerTestsuiteGeneratorOptions, TestsuiteTestcaseObject } from "../interfaces/testsuite.ts";
import { PuppeteerTranslator } from "../translators/puppeteer/puppeteer.translator.ts";

export class PuppeteerTestsuiteGenerator {
  private templateTestsuite: string;
  private templateTestcase: string;
  private options: PuppeteerTestsuiteGeneratorOptions;

  constructor(template: string, options: PuppeteerTestsuiteGeneratorOptions) {
    this.templateTestsuite = template;
    this.options = options;

    const extractResult = this.extractedTestcaseTemplate(options.templateTestcaseStart, options.templateTestcaseEnd, template);
    if (!extractResult) {
      throw new Error(`Can't extract testcase template got: ${extractResult}`);
    }

    this.templateTestcase = extractResult.testcaseTemplate;
    this.templateTestsuite = extractResult.testsuiteTemplateNoTestcase;
  }

  public async generate(testsuiteName: string, testcases: TestsuiteTestcaseObject[]) {
    let generatedTestcasesCode = "";

    for (const testcase of testcases) {
      // new test translator
      const testcaseTranslator = new PuppeteerTranslator();

      // generate test code from steps
      const testcaseGeneratedCode = await testcaseTranslator.generate(testcase.finalizedSteps);

      // replace `// {{TESTCASE_NAME}}` with testcase name
      let buffer = this.templateTestcase.replace(this.options.placeholderTestcaseName, testcase.testcase.name);

      // replace `// {{TESTCASE_GENERATED_CODE}}` with generated code
      buffer = buffer.replace(this.options.placeholderTestcaseStepCode, testcaseGeneratedCode);

      // add code to buffer
      generatedTestcasesCode += "\n\n" + buffer;
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
  ): { testcaseTemplate: string; testsuiteTemplateNoTestcase: string } | null {
    const startIndex = template.indexOf(startMarker) + startMarker.length;
    const endIndex = template.indexOf(endMarker);

    if (startIndex > -1 && endIndex > startIndex) {
      const testcaseTemplate = template.slice(startIndex, endIndex).trim();
      const testsuiteTemplateNoTestcase =
        template.slice(0, startIndex - startMarker.length).trim() + "\n" + template.slice(endIndex + endMarker.length).trim();

      return { testcaseTemplate, testsuiteTemplateNoTestcase };
    }

    return null;
  }
}
