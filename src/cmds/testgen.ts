import { Command } from "commander";
import { modelOpenAI } from "../models/openai.ts";
import { BaseMessage } from "@langchain/core/messages";
import { PuppeteerController } from "../controllers/puppeteer.controller.ts";
import { TestStepGenerator } from "../generators/generator.ts";
import { DEFAULT_SYSTEM_FINALIZE_PROMPT, DEFAULT_SYSTEM_INSTRUCTION_PROMPT } from "../prompts/index.ts";
import { createDir, createDirIgnoreFile, writeFileString } from "../helpers/files.ts";
import { DEFAULT_PUPPETEER_TEMPLATE, PuppeteerTranslator } from "../translators/index.ts";
import { formatTSCode } from "../helpers/formatter.ts";
import path from "path";
import { spawn } from "child_process";

export async function main() {
  const program = new Command();

  program
    .description("Generate test from prompting")
    .option("-o, --out", "Output path for generated test file", "app.test.ts")
    .option("-gd, --gendir", "Directory to save generated cache", ".gen/")
    .option("-t, --test", "Run test only", false)
    .option("-v, --verbose", "Verbose log", false);

  program.parse();

  const args = program.args;
  const options = program.opts();

  if (options.test) {
    // Run `vitest` as a child process
    const vitest = spawn("vitest", ["run"], { stdio: "inherit" });

    // Exit the current script after `vitest` is executed
    vitest.on("close", (code: any) => {
      console.log(`Vitest exited with code ${code}`);
      process.exit(code);
    });

    return;
  }

  if (!process.env.OPENAI_API_KEY) {
    console.error("env OPENAI_API_KEY is not set!");
    return;
  }

  const OUT_GEN_DIR = options.gendir;
  const OUT_GENTEST_PATH = options.out;
  const OUT_STEP_ALL = path.join(OUT_GEN_DIR, "steps.all.json");
  const OUT_STEP_FINALIZED = path.join(OUT_GEN_DIR, "steps.finalized.json");
  const OUT_MESSAGE_BUFFER = path.join(OUT_GEN_DIR, "messages.json");

  const USER_PROMPT_TEXT = args.join(" "); // Join args into a single sentence

  if (!USER_PROMPT_TEXT) {
    console.error("User prompt not found. please run `aitestgen <YOUR PROMPT HERE>`");
    return;
  }

  console.log("User Prompt:", USER_PROMPT_TEXT);

  // create gen directory
  await createDir(OUT_GEN_DIR);

  const model = modelOpenAI;
  const messageBuffer: Array<BaseMessage> = [];
  const webController = new PuppeteerController();

  const testStepGenerator = new TestStepGenerator(
    model,
    webController,
    DEFAULT_SYSTEM_INSTRUCTION_PROMPT,
    DEFAULT_SYSTEM_FINALIZE_PROMPT,
  );

  testStepGenerator.setVerbose(options.verbose);

  const finalizedSteps = await testStepGenerator.generate(USER_PROMPT_TEXT, messageBuffer);

  // write generated steps to file
  await writeFileString(OUT_STEP_ALL, JSON.stringify(testStepGenerator.getGeneratedSteps()));

  // write finalize steps to file
  await writeFileString(OUT_STEP_FINALIZED, JSON.stringify(finalizedSteps));

  // new puppeteer translator
  const puppeteerTestGen = new PuppeteerTranslator(
    finalizedSteps,
    DEFAULT_PUPPETEER_TEMPLATE,
    "browser",
    "page",
    "// {{GENERATED_CODE}}",
  );

  // generate the test code
  let generatedTestCode = await puppeteerTestGen.generate();

  try {
    // try formatting the generated code
    let formattedCode = await formatTSCode(generatedTestCode);

    // save formatted generated test code to file
    await writeFileString(OUT_GENTEST_PATH, formattedCode);
  } catch (error) {
    console.error("failed to format test code", error);
  }

  // write message buffer to file
  await writeFileString(OUT_MESSAGE_BUFFER, JSON.stringify(messageBuffer));

  console.log("Total Tokens used:", testStepGenerator.getTotalTokens());
  console.log("Generated test code saved at:", OUT_GENTEST_PATH);
}
