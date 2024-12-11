import { Command } from "commander";
import { GenCommand } from "./gen.ts";

export async function main() {
  const program = new Command();

  program.description(`A command-line tool that leverages AI to automatically generate test cases from natural language prompts. 
This tool helps developers quickly create comprehensive test suites by describing what they want to test in plain English.`);

  const genCommand = new GenCommand();
  program.addCommand(genCommand);

  program.parse();

  switch (program.args[0]) {
    case "gen":
      genCommand.run();
      return;
    default:
      console.log("Unknown args:", program.args[0]);
      process.exit(1);
  }
}
