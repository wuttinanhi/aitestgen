import { BaseMessage } from "@langchain/core/messages";
import ora from "ora";
import path from "path";
import { PuppeteerController } from "../controllers/puppeteer.controller.ts";
import { TestStepGenerator } from "../generators/generator.ts";
import { createDir, writeFileString } from "../helpers/files.ts";
import { formatTSCode } from "../helpers/formatter.ts";
import { AIModel } from "../models/types.ts";
import { createMessageBuffer, getOllamaModel, getOpenAIModel, parseModel } from "../models/wrapper.ts";
import { DEFAULT_SYSTEM_FINALIZE_PROMPT, DEFAULT_SYSTEM_INSTRUCTION_PROMPT } from "../prompts/index.ts";
import { DEFAULT_PUPPETEER_TEMPLATE, PuppeteerTranslator } from "../translators/index.ts";
import { Command, createCommand } from "commander";
import { addGenericOptions, createTestStepGeneratorWithOptions, createWebControllerWithOptions } from "../helpers/cli.ts";
import { IStep } from "../interfaces/step.ts";

export class PromptCommand extends Command {
  protected spinner = ora({
    // enable ctrl + c for cancel
    // https://github.com/sindresorhus/ora/issues/156
    hideCursor: false,
    discardStdin: false,
    text: `Generating test...\n`,
  });

  constructor() {
    super("prompt");

    this.description("Generate test from prompting");
    this.option("-p, --prompt <text>", "Prompt message to generate the test", "");

    addGenericOptions(this as Command);
  }

  public async run() {
    let exitcode = 0;

    const options = this.opts();

    const OUT_GEN_DIR = options.gendir;
    const OUT_GENTEST_PATH = options.out;
    const OUT_STEP_ALL = path.join(OUT_GEN_DIR, "steps.all.json");
    const OUT_STEP_FINALIZED = path.join(OUT_GEN_DIR, "steps.finalized.json");
    const OUT_MESSAGE_BUFFER = path.join(OUT_GEN_DIR, "message.buffer.json");
    const USER_PROMPT_TEXT = options.prompt;

    let messageBuffer = createMessageBuffer();
    let generatedStep: IStep[] = [];
    let finalizedSteps: IStep[] = [];

    try {
      if (!USER_PROMPT_TEXT) {
        console.error("User prompt not found. use `--prompt <YOUR PROMPT HERE>` to set prompt");
        process.exit(1);
      }

      console.log("💬  User Prompt:", USER_PROMPT_TEXT);

      // create gen directory
      await createDir(OUT_GEN_DIR);

      const model = parseModel(options);

      const webController = createWebControllerWithOptions(options);

      const testStepGenerator = createTestStepGeneratorWithOptions(model, webController, options);

      // get finalized generate steps
      finalizedSteps = await testStepGenerator.generate(USER_PROMPT_TEXT, messageBuffer);

      // get generated step (not finalized)
      generatedStep = testStepGenerator.getGeneratedSteps();

      // new puppeteer translator
      const puppeteerTestGen = new PuppeteerTranslator("browser", "page");
      // generate the test code
      let generatedTestCode = await puppeteerTestGen.generate(finalizedSteps);

      let replacedCode = DEFAULT_PUPPETEER_TEMPLATE.replace("// {{TESTCASE_GENERATED_CODE}}", generatedTestCode);

      // try formatting the generated test code
      try {
        let formattedCode = await formatTSCode(replacedCode);
        // save formatted generated test code to file
        await writeFileString(OUT_GENTEST_PATH, formattedCode);
      } catch (_) {
        // error is okay. save unformatted code
        console.error("failed to format generated test code");
        await writeFileString(OUT_GENTEST_PATH, replacedCode);
      }

      console.log("Total Tokens used:", testStepGenerator.getTotalTokens());
      console.log("💾  Generated test code saved at:", OUT_GENTEST_PATH);
    } catch (error) {
      console.error("prompt command error", error);
      exitcode = 1;
    } finally {
      // write generated steps to file
      await writeFileString(OUT_STEP_ALL, JSON.stringify(generatedStep));
      // write finalize steps to file
      await writeFileString(OUT_STEP_FINALIZED, JSON.stringify(finalizedSteps));

      // write message buffer to file
      await writeFileString(OUT_MESSAGE_BUFFER, JSON.stringify(messageBuffer));

      process.exit(exitcode);
    }
  }

  startSpinner() {
    if (!this.opts().verbose) {
      this.spinner.start();
    }
  }

  stopSpinner() {
    this.spinner.text = "Completed!\n";
    this.spinner.stop();
  }
}
