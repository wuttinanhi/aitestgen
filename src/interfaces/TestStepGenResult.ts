import { StepHistory } from "../steps/stephistory";

export class TestStepGenResult {
  stepHistory: StepHistory;
  totalTokens: number;

  constructor(stepHistory: StepHistory, totalTokens: number) {
    this.stepHistory = stepHistory;
    this.totalTokens = totalTokens;
  }
}
