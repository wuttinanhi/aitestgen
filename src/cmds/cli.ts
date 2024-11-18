import { Command, createCommand } from "commander";
import { GenCommand } from "./gen.ts";
import { addGenericOptions } from "../helpers/cli.ts";
import { PromptCommand } from "./prompt.ts";
import { TestCommand } from "./test.ts";

export async function main() {
  const program = new Command();

  program.description(
    `A command-line tool that leverages AI to automatically generate test cases from natural language prompts. 
This tool helps developers quickly create comprehensive test suites by describing what they want to test in plain English.`,
  );

  const promptCommand = new PromptCommand();
  program.addCommand(promptCommand);

  const genCommand = new GenCommand();
  program.addCommand(genCommand);

  const testCommand = new TestCommand();
  program.addCommand(testCommand);

  program.parse();

  switch (program.args[0]) {
    case "prompt":
      promptCommand.parse();
      promptCommand.run();
      break;
    case "test":
      testCommand.run();
      break;
    case "gen":
      genCommand.parse();
      genCommand.run();
      break;
    default:
      console.log("Unknown args:", program.args[0]);
      process.exit(1);
  }
}
