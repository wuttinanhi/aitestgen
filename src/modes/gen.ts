import { BaseMessage } from "@langchain/core/messages";
import { createTestStepGeneratorWithOptions, createWebControllerWithOptions } from "../helpers/cli.ts";
import { Step } from "../interfaces/step.ts";
import { AIModel } from "../models/types.ts";
import { createMessageBuffer, parseModel } from "../models/wrapper.ts";
import { TestsuiteTestcaseObject } from "../testsuites/puppeteer.testsuite.ts";
import { getTestsuiteGeneratorByTranslator } from "../testsuites/wrapper.ts";
import { getTemplateByTranslatorName } from "../translators/index.ts";
import { Testcase, TestPrompt } from "../interfaces/testprompt.ts";
import { formatCodeByLanguage } from "../helpers/formatter.ts";

export interface genModeOptions {
  genDir: string;
  verbose: boolean;
  headless: boolean;
  testPrompt: TestPrompt;
}

export interface TestGenWorkerResult {
  testcase: Testcase;
  generatedSteps: Step[];
  finalizedSteps: Step[];
  messageBuffer: BaseMessage[];
}

export interface TestGenWorkerOptions {
  model: AIModel;
  testcase: Testcase;
  verbose: boolean;
  headless: boolean;
  saveBuffer: Array<TestGenWorkerResult>;
}

export async function runGenMode(options: genModeOptions) {
  const testsuiteName = options.testPrompt.testsuite.name;

  // parse cli options and then replace with options from file
  const parseModelOptions = {
    ...options,
    ...options.testPrompt.testsuite,
  };
  const model = parseModel(parseModelOptions as any);

  console.log("Generating...");

  const workerResultBuffer: TestGenWorkerResult[] = [];

  // xml parser may parse array or single object here
  if (Array.isArray(options.testPrompt.testsuite.testcases.testcase)) {
    const waitGroup = [];

    for (const testcase of options.testPrompt.testsuite.testcases.testcase) {
      waitGroup.push(
        testGenWorker({
          model,
          testcase,
          verbose: options.verbose,
          headless: options.headless,
          saveBuffer: workerResultBuffer,
        }),
      );
    }

    await Promise.allSettled(waitGroup);
  } else {
    // single object
    const testcase: Testcase = {
      name: (options.testPrompt.testsuite.testcases.testcase as unknown as Testcase).name,
      prompt: (options.testPrompt.testsuite.testcases.testcase as unknown as Testcase).prompt,
    };

    await testGenWorker({
      model,
      testcase,
      verbose: options.verbose,
      headless: options.headless,
      saveBuffer: workerResultBuffer,
    });
  }

  const language = options.testPrompt.testsuite.language;
  const translatorName = options.testPrompt.testsuite.translator;
  const templateCode = getTemplateByTranslatorName(translatorName);

  // new testsuite generator
  const testsuiteGenerator = getTestsuiteGeneratorByTranslator(translatorName, templateCode);

  // map worker result to TestsuiteTestcaseObject
  const testcases: TestsuiteTestcaseObject[] = workerResultBuffer.map((result) => {
    return {
      testcase: result.testcase,
      steps: result.finalizedSteps,
    } as TestsuiteTestcaseObject;
  });

  // generate complete testsuite code
  let testsuiteCode = await testsuiteGenerator.generate(testsuiteName, testcases);

  try {
    // try format testsuite code
    testsuiteCode = await formatCodeByLanguage(language, testsuiteCode);
  } catch (_) {
    // error is okay. save unformatted code
    console.error("Failed to format testsuite code");
  }

  return { testsuiteCode, testcases };
}

async function testGenWorker(options: TestGenWorkerOptions) {
  console.log(`Generating testcase: ${options.testcase.name}`);

  const messageBuffer = createMessageBuffer();

  const webController = createWebControllerWithOptions({ headless: options.headless });

  const testStepGenerator = createTestStepGeneratorWithOptions(options.model, webController, { verbose: options.verbose });

  // finalize steps
  const finalizedSteps = await testStepGenerator.generate(options.testcase.prompt, messageBuffer);
  const generatedSteps = await testStepGenerator.getGeneratedSteps();

  options.saveBuffer.push({
    testcase: options.testcase,
    generatedSteps,
    finalizedSteps,
    messageBuffer,
  });
}
