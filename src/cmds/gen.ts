import { Command } from "commander";
import { addGenericOptions } from "../helpers/cli.ts";

export class GenCommand extends Command {
  constructor() {
    super("gen");

    this.description("Generate test from test prompt file");
    this.option("-f, --file <path>", "Specify test prompt file path", "");

    addGenericOptions(this as any);
  }
}
