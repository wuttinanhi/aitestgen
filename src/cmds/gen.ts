import path from "path";
import { createDir, fileExists, readFileString, writeFileString } from "src/helpers/files.ts";
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
import { IStep } from "../interfaces/step.ts";
import { write } from "fs";

export class GenCommand extends Command {
  constructor() {
    super("gen");

    this.description("Generate test from test prompt file");
    this.option("-f, --file <path>", "Specify test prompt file path", "");

    addGenericOptions(this as any);
  }

  async run() {
    let exitCode = 0;

    const options = this.opts();

    let OUT_GEN_DIR = options.gendir;
    let OUT_TESTSUITE_PATH;
    let OUT_TESTSUITE_STEP_PATH;

    const testsuiteTestcases: TestsuiteTestcaseObject[] = [];

    try {
      const testPromptPath = options.file;

      if (testPromptPath === "") {
        console.log(`No test prompt file specified use "-f, --file" to specify`);
        process.exit(1);
      }

      const fileFound = await fileExists(testPromptPath);
      if (!fileFound) {
        console.error("File not found", testPromptPath);
        process.exit(1);
      }

      // create gen dir
      await createDir(OUT_GEN_DIR);

      console.log("Using test prompt file:", testPromptPath);

      const testPromptString = await readFileString(testPromptPath);
      const testPrompt = parseTestPrompt(testPromptString);

      OUT_TESTSUITE_PATH = testPrompt.testsuite.output;
      OUT_TESTSUITE_STEP_PATH = path.join(OUT_GEN_DIR, `${testPrompt.testsuite.output}.steps.json`);

      const testsuiteName = testPrompt.testsuite.name;

      const model = parseModel(options);

      console.log("Generating...");

      if (Array.isArray(testPrompt.testsuite.testcases.testcase)) {
        for (const testcase of testPrompt.testsuite.testcases.testcase) {
          const result = await this.testGenWorker(model, options, testcase);

          // append result to array
          testsuiteTestcases.push({ testcase: testcase, steps: result.finalizedSteps });
        }
      } else {
        // single object
        const testcase: Testcase = {
          name: (testPrompt.testsuite.testcases.testcase as unknown as Testcase).name,
          prompt: (testPrompt.testsuite.testcases.testcase as unknown as Testcase).prompt,
        };

        const result = await this.testGenWorker(model, options, testcase);

        // append result to array
        testsuiteTestcases.push({ testcase: testcase, steps: result.finalizedSteps });
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

      let formattedCode: string;
      try {
        // format testsuite code
        formattedCode = await formatTSCode(testsuiteCode);
        await writeFileString(OUT_TESTSUITE_PATH, formattedCode);
      } catch (_) {
        // error is okay. save unformatted code
        console.error("Failed to format testsuite code");
        await writeFileString(OUT_TESTSUITE_PATH, testsuiteCode);
      }

      console.log("Testsuite output paht:", OUT_TESTSUITE_PATH);
    } catch (error) {
      console.error("gen command error", error);
      exitCode = 1;
    } finally {
      // save steps to file
      if (OUT_TESTSUITE_STEP_PATH) {
        const TestcaseSteps = testsuiteTestcases.map((tc) => {
          return { testcaseName: tc.testcase.name, finalizedSteps: tc.steps };
        });

        console.log("Testsuite steps saved at:", OUT_TESTSUITE_STEP_PATH);
        await writeFileString(OUT_TESTSUITE_STEP_PATH, JSON.stringify(TestcaseSteps));
      }

      process.exit(exitCode);
    }
  }

  async testGenWorker(model: AIModel, options: any, testcase: Testcase) {
    this.logTestcase(testcase);

    const messageBuffer = createMessageBuffer();

    const webController = createWebControllerWithOptions(options);

    const testStepGenerator = createTestStepGeneratorWithOptions(model, webController, options);

    // generate steps
    const finalizedSteps = await testStepGenerator.generate(testcase.prompt, messageBuffer);

    const generatedStep = testStepGenerator.getGeneratedSteps();

    return { finalizedSteps, generatedStep };
  }

  logTestcase(testcase: Testcase) {
    if (!this.opts().verbose) return;
    console.log("Testcase name:", testcase.name);
  }
}
