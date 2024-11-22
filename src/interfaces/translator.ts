import { Step } from "./step.ts";

export interface TestTranslator {
  generate(steps: Step[]): Promise<string>;
}
