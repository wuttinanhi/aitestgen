import { Command, createCommand } from "commander";
import { makeGenCommand, runGenMode } from "./gen.ts";
import { makePromptCommand, runPromptMode } from "./prompt.ts";
import { makeTestCommand, runTestMode } from "./test.ts";
import { addGenericOptions } from "./options.ts";

export async function main() {
  const program = new Command();

  program.description(
    `A command-line tool that leverages AI to automatically generate test cases from natural language prompts. 
This tool helps developers quickly create comprehensive test suites by describing what they want to test in plain English.`,
  );

  const promptCommand = makePromptCommand();
  program.addCommand(promptCommand);

  const genCommand = makeGenCommand();
  program.addCommand(genCommand);

  const testCommand = makeTestCommand();
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
