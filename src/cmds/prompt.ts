import { Command } from "commander";
import { addGenericOptions } from "../helpers/cli.ts";

export class PromptCommand extends Command {
  constructor() {
    super("prompt");

    this.description("Generate test from prompting");
    this.option("-p, --prompt <text>", "Prompt message to generate the test", "");

    addGenericOptions(this as Command);
  }
}
