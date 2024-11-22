import { IStep } from "./step.ts";

export interface TestTranslator {
  generate(steps: IStep[]): Promise<string>;
}
