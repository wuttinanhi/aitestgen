import { convertLangchainBaseMessageToShareGPT } from "src/helpers/converter.ts";
import { createTestStepGeneratorWithOptions, createWebControllerWithOptions } from "../helpers/cli.ts";
import { formatCodeByLanguage } from "../helpers/formatter.ts";
import { Testcase, TestPrompt } from "../interfaces/testprompt.ts";
import { TestsuiteTestcaseObject } from "../interfaces/testsuite.ts";
import { AIModel } from "../models/types.ts";
import { createMessageBuffer, parseModel } from "../models/wrapper.ts";
import { getTemplateByTranslatorName } from "../templates/index.ts";
import { getTestsuiteGeneratorByTranslator } from "../testsuites/wrapper.ts";

export interface genModeOptions {
  genDir: string;
  verbose: boolean;
  headless: boolean;
  testPrompt: TestPrompt;
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

  const testGenerationTasks = [];

  // xml parser may parse single object here
  if (Array.isArray(options.testPrompt.testsuite.testcases.testcase)) {
    // array of testcases
    testGenerationTasks.push(...options.testPrompt.testsuite.testcases.testcase);
  } else {
    // single testcase object
    const singleTestcase: Testcase = {
      name: (options.testPrompt.testsuite.testcases.testcase as unknown as Testcase).name,
      prompt: (options.testPrompt.testsuite.testcases.testcase as unknown as Testcase).prompt,
    };

    testGenerationTasks.push(singleTestcase);
  }

  const waitGroup = [];

  for (const testcase of testGenerationTasks) {
    waitGroup.push(
      testGenWorker({
        model,
        testcase,
        verbose: options.verbose,
        headless: options.headless,
      }),
    );
  }

  // wait all worker to complete
  const waitResult = await Promise.allSettled(waitGroup);

  // filter only resolved
  const filterOnlyResolved = waitResult.filter((result) => result.status === "fulfilled");

  // convert result to TestsuiteTestcaseObject
  const testcasesResult = filterOnlyResolved.map((result) => result.value);

  const language = options.testPrompt.testsuite.language;
  const translatorName = options.testPrompt.testsuite.translator;
  const templateCode = getTemplateByTranslatorName(translatorName);

  // new testsuite generator
  const testsuiteGenerator = getTestsuiteGeneratorByTranslator(translatorName, templateCode);

  // generate complete testsuite code
  let testsuiteCode = await testsuiteGenerator.generate(testsuiteName, testcasesResult);

  try {
    // try format testsuite code
    testsuiteCode = await formatCodeByLanguage(language, testsuiteCode);
  } catch (_) {
    // error is okay. save unformatted code
    console.error("Failed to format testsuite code. testsuite code will save without format code");
  }

  return { testsuiteCode, testcasesResult };
}

export interface TestGenWorkerOptions {
  model: AIModel;
  testcase: Testcase;
  verbose: boolean;
  headless: boolean;
}

async function testGenWorker(options: TestGenWorkerOptions) {
  console.log(`Generating testcase: ${options.testcase.name}`);

  const messageBuffer = createMessageBuffer();

  const webController = createWebControllerWithOptions({ headless: options.headless });

  const testStepGenerator = createTestStepGeneratorWithOptions(options.model, webController, { verbose: options.verbose });

  // finalize steps
  const finalizedSteps = await testStepGenerator.generate(options.testcase.prompt, messageBuffer);
  const generatedSteps = testStepGenerator.getGeneratedSteps();

  // convert message buffer to sharegpt messages
  const shareGPTMessages = convertLangchainBaseMessageToShareGPT(messageBuffer);

  return {
    testcase: options.testcase,
    generatedSteps,
    finalizedSteps,
    messageBuffer,
    shareGPTMessages,
  } as TestsuiteTestcaseObject;
}
