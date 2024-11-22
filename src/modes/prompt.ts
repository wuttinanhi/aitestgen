import { TestStepGenerator } from "../generators/generator.ts";
import { WebController } from "../interfaces/controller.ts";
import { TestTranslator } from "../interfaces/translator.ts";
import { AIModel } from "../models/types.ts";
import { createMessageBuffer } from "../models/wrapper.ts";
import { PuppeteerTranslator } from "../translators/index.ts";

export interface promptModeOptions {
  promptText: string;
  model: AIModel;
  webController: WebController;
  testStepGenerator: TestStepGenerator;
  translator: TestTranslator;
  testCodeTemplate: string;
}

export async function runPromptMode(options: promptModeOptions) {
  let messageBuffer = createMessageBuffer();

  // get finalized generate steps
  const finalizedSteps = await options.testStepGenerator.generate(options.promptText, messageBuffer);

  // get generated step (not finalized)
  const generatedSteps = options.testStepGenerator.getGeneratedSteps();

  // generate the test code
  let generatedTestCode = await options.translator.generate(finalizedSteps);

  return {
    generatedSteps,
    finalizedSteps,
    generatedTestCode,
    messageBuffer,
  };
}
