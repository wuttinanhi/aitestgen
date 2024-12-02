import { SeleniumTestsuiteGeneratorOptions, TestsuiteTestcaseObject } from "../interfaces/testsuite.ts";
import { SeleniumTranslator } from "../translators/selenium/selenium.translator.ts";

export class SeleniumTestsuiteGenerator {
  private templateTestsuite: string;
  private templateTestcase: string;
  private options: SeleniumTestsuiteGeneratorOptions;

  constructor(template: string, options: SeleniumTestsuiteGeneratorOptions) {
    this.templateTestsuite = template;
    this.options = options;

    const extractedTestcaseTemplate = this.extractedTestcaseTemplate(options.templateTestcaseStart, options.templateTestcaseEnd, template);
    if (!extractedTestcaseTemplate) {
      throw new Error(`Can't extract testcase template got: ${extractedTestcaseTemplate}`);
    }

    this.templateTestcase = extractedTestcaseTemplate.extracted;
    this.templateTestsuite = extractedTestcaseTemplate.modifiedTemplate;
  }

  public async generate(javaClassName: string, testcases: TestsuiteTestcaseObject[]) {
    let generatedTestcasesCode = "";

    for (const testcase of testcases) {
      // new test translator
      const testcaseTranslator = new SeleniumTranslator();

      // generate test code from steps
      const generatedCode = await testcaseTranslator.generate(testcase.finalizedSteps);

      // replace `TESTCASE_NAME` with testcase name
      let buffer = this.templateTestcase.replace(this.options.placeholderJavaMethodName, testcase.testcase.name);

      // replace `// {{TESTCASE_GENERATED_CODE}}` with generated code
      buffer = buffer.replace(this.options.placeholderTestcaseStepCode, generatedCode);

      // add code to buffer
      generatedTestcasesCode += buffer;
    }

    // replace `CLASS_NAME_HERE` with class name
    let testsuiteCode = this.templateTestsuite.replace(this.options.placeholderJavaClassName, javaClassName);

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
