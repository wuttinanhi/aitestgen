import path from "path";
import { createDir, fileBaseName, fileExists, readFileString, writeFileString } from "src/helpers/files.ts";
import { parseTestPrompt } from "src/testprompt/parser.ts";
import { DEFAULT_PUPPETEER_TEMPLATE, DEFAULT_SELENIUM_TEMPLATE, PuppeteerTranslator } from "../translators/index.ts";
import { formatJavaCode, formatTypescriptCode } from "../helpers/formatter.ts";
import { TestStepGenerator } from "../generators/generator.ts";
import { DEFAULT_SYSTEM_FINALIZE_PROMPT, DEFAULT_SYSTEM_INSTRUCTION_PROMPT } from "../prompts/index.ts";
import { BaseMessage } from "@langchain/core/messages";
import { PuppeteerController } from "../controllers/puppeteer.controller.ts";
import { createMessageBuffer, parseModel } from "../models/wrapper.ts";
import { AIModel } from "../models/types.ts";
import { PuppeteerTestsuiteGenerator, TestsuiteTestcaseObject } from "../testsuites/puppeteer.testsuite.ts";
import { Testcase, TestPromptRoot, Testsuite } from "../interfaces/testprompt.ts";
import { Command, createCommand } from "commander";
import { addGenericOptions, createTestStepGeneratorWithOptions, createWebControllerWithOptions } from "../helpers/cli.ts";
import { WebController } from "../interfaces/controller.ts";
import { IStep } from "../interfaces/step.ts";
import { write } from "fs";
import { SeleniumTestsuiteGenerator } from "../testsuites/selenium.testsuite.ts";

export class GenCommand extends Command {
  constructor() {
    super("gen");

    this.description("Generate test from test prompt file");
    this.option("-f, --file <path>", "Specify test prompt file path", "");
    this.option("-translate, --translate <path>", "Translate from json file only", "");

    addGenericOptions(this as any);
  }

  async run() {
    let exitCode = 0;

    const options = this.opts();

    let OUT_GEN_DIR = options.gendir;
    let OUT_TESTSUITE_PATH;
    let OUT_TESTSUITE_STEP_PATH;

    let testPrompt: TestPromptRoot;

    const testsuiteTestcases: TestsuiteTestcaseObject[] = [];

    if (options.translate) {
      const translateJsonPath = options.translate;
      console.log("Translate:", translateJsonPath);

      await this.translateOnly(translateJsonPath);
      process.exit(0);
    }

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

      const testPromptRaw = await readFileString(testPromptPath);
      testPrompt = parseTestPrompt(testPromptRaw);

      OUT_TESTSUITE_PATH = testPrompt.testsuite.output;
      OUT_TESTSUITE_STEP_PATH = path.join(OUT_GEN_DIR, fileBaseName(`${testPrompt.testsuite.output}.steps.json`));

      const TEST_LANGUAGE = testPrompt.testsuite.language;

      const model = parseModel(options);

      console.log(`Test language: ${TEST_LANGUAGE}`);
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

      switch (TEST_LANGUAGE) {
        case "typescript":
          await this.generatePuppeteerTestsuite(testPrompt, OUT_TESTSUITE_PATH, testsuiteTestcases);
          break;
        case "java":
          await this.generateSeleniumTestsuite(testPrompt, OUT_TESTSUITE_PATH, testsuiteTestcases);
          break;
        default:
          console.error(`Unknown test language ${TEST_LANGUAGE}`);
          exitCode = 1;
          return;
      }

      console.log("Testsuite output paht:", OUT_TESTSUITE_PATH);
    } catch (error) {
      console.error("gen command error", error);
      exitCode = 1;
    } finally {
      // save steps to file
      if (OUT_TESTSUITE_STEP_PATH) {
        const testcases = testsuiteTestcases.map((tc) => {
          return { testcaseName: tc.testcase.name, finalizedSteps: tc.steps };
        });

        console.log("Testsuite steps saved at:", OUT_TESTSUITE_STEP_PATH);

        const outData = testPrompt!;
        outData.testsuite.testcases = testcases as any;

        await writeFileString(OUT_TESTSUITE_STEP_PATH, JSON.stringify(outData));
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

  async generatePuppeteerTestsuite(testprompt: TestPromptRoot, testsuitOutpath: string, testsuiteTestcases: TestsuiteTestcaseObject[]) {
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
    const testsuiteName = testprompt.testsuite.name;
    const generatedCode = await testsuiteGen.generate(testsuiteName, testsuiteTestcases);

    try {
      // format testsuite code
      const formattedCode = await formatTypescriptCode(generatedCode);
      await writeFileString(testsuitOutpath, formattedCode);
    } catch (_) {
      // error is okay. save unformatted code
      console.error("Failed to format testsuite code");
      await writeFileString(testsuitOutpath, generatedCode);
    }
  }

  async generateSeleniumTestsuite(testprompt: TestPromptRoot, testsuitOutpath: string, testsuiteTestcases: TestsuiteTestcaseObject[]) {
    const testsuiteGenerator = new SeleniumTestsuiteGenerator(DEFAULT_SELENIUM_TEMPLATE, {
      placeholderTestcasesCode: "// {{TESTCASES}}",
      templateTestcaseStart: "// --- START TESTCASE ---",
      templateTestcaseEnd: "// --- END TESTCASE ---",
      placeholderTestcaseStepCode: "// {{TESTCASE_GENERATED_CODE}}",
      placeholderJavaMethodName: "TESTCASE_NAME",
      placeholderJavaClassName: "CLASS_NAME_HERE",
    });

    // generate complete testsuite code
    const javaClassName = testprompt.testsuite.java_classname;
    const generatedCode = await testsuiteGenerator.generate(javaClassName, testsuiteTestcases);

    try {
      // format testsuite code
      const formattedCode = await formatJavaCode(generatedCode);
      await writeFileString(testsuitOutpath, formattedCode);
    } catch (_) {
      // error is okay. save unformatted code
      console.error("Failed to format testsuite code");
      await writeFileString(testsuitOutpath, generatedCode);
    }
  }

  async translateOnly(jsonPath: string) {
    const fileData = await readFileString(jsonPath);
    const testprompt = JSON.parse(fileData) as TestPromptRoot;

    console.log(`language: ${testprompt.testsuite.language}`);

    const testsuite_Testcases: TestsuiteTestcaseObject[] = [];

    for (const t of testprompt.testsuite.testcases as any as Testcase[]) {
      const testcase = t as any as {
        testcaseName: string;
        finalizedSteps: IStep[];
      };

      // console.log(testcase);

      testsuite_Testcases.push({
        testcase: {
          name: testcase.testcaseName,
          prompt: "",
        },
        steps: testcase.finalizedSteps,
      });
    }

    await this.generateSeleniumTestsuite(testprompt, testprompt.testsuite.output, testsuite_Testcases);

    console.log("Saved at:", testprompt.testsuite.output);
  }
}
