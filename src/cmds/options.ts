import { Command } from "commander";

export function addGenericOptions(command: Command) {
  command
    .option("-o, --out <path>", "Output path for generated test file", "app.test.ts")
    .option("-gd, --gendir <path>", "Directory to save generated cache", ".gen/")
    .option("-p, --provider <provider>", `Set model provider "openai" "ollama"`, "openai")
    .option("-m, --model <model>", "Specify model to use", "gpt-4o-mini")
    .option("-oh, --ollamahost <url>", "Set Ollama endpoint", "http://localhost:11434")
    .option("-hl, --headless <bool>", "Set browser headless mode", true)
    .option("-v, --verbose", "Verbose log", false);
}
