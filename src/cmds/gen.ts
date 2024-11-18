import path from "path";
import { fileExists, readFileString, writeFileString } from "src/helpers/files.ts";
import { parseTestPrompt } from "src/testprompt/parser.ts";
import { DEFAULT_PUPPETEER_TEMPLATE, PuppeteerTranslator } from "../translators/index.ts";
import { formatTSCode } from "../helpers/formatter.ts";
import { TestStepGenerator } from "../generators/generator.ts";
import { DEFAULT_SYSTEM_FINALIZE_PROMPT, DEFAULT_SYSTEM_INSTRUCTION_PROMPT } from "../prompts/index.ts";
import { BaseMessage } from "@langchain/core/messages";
import { PuppeteerController } from "../controllers/puppeteer.controller.ts";
import { createMessageBuffer, parseModel } from "../models/wrapper.ts";
import { AIModel } from "../models/types.ts";
import { PuppeteerTestsuiteGenerator, TestsuiteTestcaseObject } from "../testsuites/puppeteer.testsuite.ts";
import { Testcase } from "../testprompt/types.ts";
import { Command, createCommand } from "commander";
import { addGenericOptions, createTestStepGeneratorWithOptions, createWebControllerWithOptions } from "../helpers/cli.ts";
import { WebController } from "../interfaces/controller.ts";

export class GenCommand extends Command {
  constructor() {
    super("gen");

    this.description("Generate test from test prompt file");
    this.option("-f, --file <path>", "Specify test prompt file path", "");

    addGenericOptions(this as any);
  }

  async run() {
    const args = this.args;
    const opts = this.opts();

    const testPromptPath = opts.file;

    if (testPromptPath === "") {
      console.log(`No test prompt file specified use "-f, --file" to specify`);
      process.exit(1);
    }

    const fileFound = await fileExists(testPromptPath);
    if (!fileFound) {
      console.error("File not found", testPromptPath);
      process.exit(1);
    }

    console.log("Using test prompt file:", testPromptPath);

    const testPromptString = await readFileString(testPromptPath);
    const testPrompt = parseTestPrompt(testPromptString);

    const testsuiteName = testPrompt.testsuite.name;

    const model = parseModel(opts);

    const testsuiteTestcases: TestsuiteTestcaseObject[] = [];

    if (Array.isArray(testPrompt.testsuite.testcases.testcase)) {
      let i = 0;
      for (const testcase of testPrompt.testsuite.testcases.testcase) {
        const genSteps = await this.testGenWorker(model, opts, testcase);

        // append result to array
        testsuiteTestcases.push({
          testcase: testcase,
          steps: genSteps,
        });

        i++;
      }
    } else {
      // single object
      const testcase: Testcase = {
        name: (testPrompt.testsuite.testcases.testcase as unknown as Testcase).name,
        prompt: (testPrompt.testsuite.testcases.testcase as unknown as Testcase).prompt,
      };

      const genSteps = await this.testGenWorker(model, opts, testcase);

      // append result to array
      testsuiteTestcases.push({
        testcase: testcase,
        steps: genSteps,
      });
    }

    // new puppeteer testsuite generator
    const testsuiteGen = new PuppeteerTestsuiteGenerator(DEFAULT_PUPPETEER_TEMPLATE, {
      placeolderTestsuiteName: "// {{TESTSUITE_NAME}}",
      placeholderTestcasesCode: "// {{TESTCASES}}",
      templateTestcaseStart: "// --- START TESTCASE ---",
      templateTestcaseEnd: "// --- END TESTCASE ---",
      placeholderTestcaseName: "// {{TESTCASE_NAME}}",
      placeholderTestcaseStepCode: "// {{TESTCASE_GENERATED_CODE}}",
    });

    // generate complete testsuite code
    const testsuiteCode = await testsuiteGen.generate(testsuiteName, testsuiteTestcases);

    // get output path from test prompt
    const outputPath = testPrompt.testsuite.output;

    let formattedCode: string;
    try {
      // format testsuite code
      formattedCode = await formatTSCode(testsuiteCode);
      await writeFileString(outputPath, formattedCode);
    } catch (_) {
      console.error("Failed to format testsuite code");
      await writeFileString(outputPath, testsuiteCode);
    }

    console.log("Testsuite output paht:", outputPath);

    process.exit(0);
  }

  async testGenWorker(model: AIModel, options: any, testcase: Testcase) {
    this.logTestcase(testcase);

    const messageBuffer = createMessageBuffer();

    const webController = createWebControllerWithOptions(options);

    const testStepGenerator = createTestStepGeneratorWithOptions(model, webController, options);

    // generate steps
    const finalizedSteps = await testStepGenerator.generate(testcase.prompt, messageBuffer);

    return finalizedSteps;
  }

  logTestcase(testcase: Testcase) {
    if (!this.opts().verbose) return;
    console.log("Testcase name:", testcase.name);
  }
}
