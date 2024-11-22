import { Command } from "commander";
import { PuppeteerController } from "../controllers/puppeteer.controller.ts";
import { TestStepGenerator } from "../generators/generator.ts";
import { AIModel } from "../models/types.ts";
import { WebController } from "../interfaces/controller.ts";
import { DEFAULT_SYSTEM_FINALIZE_PROMPT, DEFAULT_SYSTEM_INSTRUCTION_PROMPT } from "../prompts/index.ts";

export function addGenericOptions(command: Command) {
  command
    .option("-o, --out <path>", "Output path for generated test file", "app.test.ts")
    .option("-gd, --gendir <path>", "Directory to save generated cache", ".gen/")
    .option("-pv, --provider <provider>", `Set model provider "openai" "ollama"`, "openai")
    .option("-m, --model <model>", "Specify model to use", "gpt-4o-mini")
    .option("-ollamahost, --ollamahost <url>", "Set Ollama endpoint", "http://localhost:11434")
    .option("-hl, --headless <bool>", "Set browser headless mode", true)
    .option("-v, --verbose", "Verbose log", false)
    .option("-translator, --translator", "Set test translator", "puppeteer")
    .option("-language, --language", "Set test language", "typescript");
}

export function createWebControllerWithOptions(options: { headless: boolean }) {
  const webController = new PuppeteerController();

  // set webController headless mode from cli options
  const parsedHeadless = String(options.headless).toLowerCase() === "true";

  if (parsedHeadless === false) {
    console.log("Running with headless mode:", parsedHeadless);
  }
  webController.setHeadless(parsedHeadless);

  return webController;
}

export function createTestStepGeneratorWithOptions(model: AIModel, webController: WebController, options: { verbose: boolean }) {
  // create new test step generator
  const testStepGenerator = new TestStepGenerator(model, webController, DEFAULT_SYSTEM_INSTRUCTION_PROMPT, DEFAULT_SYSTEM_FINALIZE_PROMPT);
  testStepGenerator.setVerbose(options.verbose);
  return testStepGenerator;
}
