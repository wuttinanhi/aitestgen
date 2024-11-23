import { Command } from "commander";

export class TestCommand extends Command {
  constructor() {
    super("test");
    this.description("Test generated code using vitest");
  }
}
