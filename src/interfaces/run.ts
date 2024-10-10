import { IStep } from "./step";

export interface IRunResult {
  success: boolean;
  errorName: string;
  errorMessage: string;
  errorStepIndex: number;
  errorStep: IStep;
}
