import { BaseMessage } from "@langchain/core/messages";
import { Step } from "./step.ts";
import { Testcase } from "./testprompt.ts";

export interface TestsuiteTestcaseObject {
  testcase: Testcase;
  generatedSteps: Step[];
  finalizedSteps: Step[];
  messageBuffer: BaseMessage[];
}
