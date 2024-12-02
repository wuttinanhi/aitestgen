import { BaseMessage } from "@langchain/core/messages";
import { Step } from "./step.ts";
import { Testcase } from "./testprompt.ts";

export interface TestsuiteTestcaseObject {
  testcase: Testcase;
  generatedSteps: Step[];
  finalizedSteps: Step[];
  messageBuffer: BaseMessage[];
}

export interface PuppeteerTestsuiteGeneratorOptions {
  placeolderTestsuiteName: string; // {{TESTSUITE_NAME}}
  placeholderTestcasesCode: string; // {{TESTCASES}}
  templateTestcaseStart: string; // --- START TESTCASE ---
  templateTestcaseEnd: string; // --- END TESTCASE ---
  placeholderTestcaseName: string; // {{TESTCASE_NAME}}
  placeholderTestcaseStepCode: string; // {{TESTCASE_GENERATED_CODE}}
}

export interface SeleniumTestsuiteGeneratorOptions {
  placeholderTestcasesCode: string; // {{TESTCASES}}
  templateTestcaseStart: string; // --- START TESTCASE ---
  templateTestcaseEnd: string; // --- END TESTCASE ---
  placeholderTestcaseStepCode: string; // {{TESTCASE_GENERATED_CODE}}
  placeholderJavaMethodName: string; // TESTCASE_NAME
  placeholderJavaClassName: string; // CLASS_NAME_HERE
}
