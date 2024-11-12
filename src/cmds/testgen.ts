import { Command } from "commander";
import { BaseMessage } from "@langchain/core/messages";
import { PuppeteerController } from "../controllers/puppeteer.controller.ts";
import { TestStepGenerator } from "../generators/generator.ts";
import { DEFAULT_SYSTEM_FINALIZE_PROMPT, DEFAULT_SYSTEM_INSTRUCTION_PROMPT } from "../prompts/index.ts";
import { createDir, createDirIgnoreFile, writeFileString } from "../helpers/files.ts";
import { DEFAULT_PUPPETEER_TEMPLATE, PuppeteerTranslator } from "../translators/index.ts";
import { formatTSCode } from "../helpers/formatter.ts";
import path from "path";
import { spawn } from "child_process";
import ora from "ora";
import { AIModel } from "src/models/types.ts";
import { getOllamaModel, getOpenAIModel } from "src/models/wrapper.ts";

export async function main() {
  const program = new Command();

  program
    .description("Generate test from prompting")
    .option("-o, --out <path>", "Output path for generated test file", "app.test.ts")
    .option("-gd, --gendir <path>", "Directory to save generated cache", ".gen/")
    .option("-p, --provider <provider>", `Set model provider "openai" "ollama"`, "openai")
    .option("-m, --model <model>", "Specify model to use", "gpt-4o-mini")
    .option("-oh, --ollamahost <url>", "Set Ollama endpoint", "http://localhost:11434")
    .option("-t, --test", "Run test only", false)
    .option("-v, --verbose", "Verbose log", false);

  program.parse();

  const options = program.opts();
  const args = program.args;

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

  console.log("💬  User Prompt:", USER_PROMPT_TEXT);

  // create gen directory
  await createDir(OUT_GEN_DIR);

  let model: AIModel;

  if (options.provider === "openai") {
    console.log(`🤖  Using OpenAI model ${options.model}`);

    if (!process.env.OPENAI_API_KEY) {
      console.error("env OPENAI_API_KEY is not set!");
      process.exit(1);
    }

    model = getOpenAIModel({
      model: options.model,
    });
  } else if (options.provider === "ollama") {
    console.log(`🤖  Using Ollama model ${options.model}`);

    if (!options.ollamahost) {
      console.error("Please specify Ollama host with --ollamahost <OLLAMA_ENDPOINT_URL>");
      process.exit(1);
    }

    model = getOllamaModel({
      host: options.ollamahost,
      model: options.model,
    });
  } else {
    console.error(`Unknown model provider: ${options.provider}`);
    process.exit(1);
  }

  const messageBuffer: Array<BaseMessage> = [];
  const webController = new PuppeteerController();

  const spinner = ora({
    // enable ctrl + c for cancel
    // https://github.com/sindresorhus/ora/issues/156
    hideCursor: false,
    discardStdin: false,
    text: `Generating test...\n`,
  });

  if (!options.verbose) {
    spinner.start();
  }

  // create new test step generator
  const testStepGenerator = new TestStepGenerator(model, webController, DEFAULT_SYSTEM_INSTRUCTION_PROMPT, DEFAULT_SYSTEM_FINALIZE_PROMPT);
  testStepGenerator.setVerbose(options.verbose);

  // generate steps
  const finalizedSteps = await testStepGenerator.generate(USER_PROMPT_TEXT, messageBuffer);

  // write generated steps to file
  await writeFileString(OUT_STEP_ALL, JSON.stringify(testStepGenerator.getGeneratedSteps()));
  // write finalize steps to file
  await writeFileString(OUT_STEP_FINALIZED, JSON.stringify(finalizedSteps));

  // new puppeteer translator
  const puppeteerTestGen = new PuppeteerTranslator(finalizedSteps, DEFAULT_PUPPETEER_TEMPLATE, "browser", "page", "// {{GENERATED_CODE}}");
  // generate the test code
  let generatedTestCode = await puppeteerTestGen.generate();

  try {
    // try formatting the generated test code
    let formattedCode = await formatTSCode(generatedTestCode);

    // save formatted generated test code to file
    await writeFileString(OUT_GENTEST_PATH, formattedCode);
  } catch (error) {
    console.error("failed to format generated test code", error);
  }

  // write message buffer to file
  await writeFileString(OUT_MESSAGE_BUFFER, JSON.stringify(messageBuffer));

  spinner.text = "Completed!\n";
  spinner.stop();

  console.log("🪙   Total Tokens used:", testStepGenerator.getTotalTokens());
  console.log("💾   Generated test code saved at:", OUT_GENTEST_PATH);
}
