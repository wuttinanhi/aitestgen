import { Command, createCommand } from "commander";
import { runGenMode } from "../modes/gen.ts";
import { runPromptMode } from "../modes/prompt.ts";
import { runTestMode } from "../modes/test.ts";

export async function main() {
  const program = new Command();

  program.description(
    `A command-line tool that leverages AI to automatically generate test cases from natural language prompts. 
This tool helps developers quickly create comprehensive test suites by describing what they want to test in plain English.`,
  );

  function addGenericOptions(command: Command) {
    command
      .option("-o, --out <path>", "Output path for generated test file", "app.test.ts")
      .option("-gd, --gendir <path>", "Directory to save generated cache", ".gen/")
      .option("-p, --provider <provider>", `Set model provider "openai" "ollama"`, "openai")
      .option("-m, --model <model>", "Specify model to use", "gpt-4o-mini")
      .option("-oh, --ollamahost <url>", "Set Ollama endpoint", "http://localhost:11434")
      .option("-hl, --headless <bool>", "Set browser headless mode", true)
      .option("-v, --verbose", "Verbose log", false);
  }

  const promptCommand = createCommand("prompt").description("Generate test from prompting");
  addGenericOptions(promptCommand);

  program.addCommand(promptCommand);

  const genCommand = createCommand("gen")
    .description("Generate test from test prompt file")
    .option("-f, --file <path>", "Specify test prompt file path", "");

  addGenericOptions(genCommand);

  program.addCommand(genCommand);

  const testCommand = createCommand("test").description("Test generated code using vitest");
  program.addCommand(testCommand);

  program.parse();

  switch (program.args[0]) {
    case "prompt":
      promptCommand.parse();
      runPromptMode(promptCommand.args, promptCommand.opts());
      break;
    case "test":
      runTestMode();
      break;
    case "gen":
      genCommand.parse();
      runGenMode(genCommand.args, genCommand.opts());
      break;
    default:
      console.log("Unknown args:", program.args[0]);
      process.exit(1);
  }
}
