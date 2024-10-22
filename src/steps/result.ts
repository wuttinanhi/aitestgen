import { StepHistory } from "./stephistory";

export class TestStepGenResult {
  private stepHistory: StepHistory;
  private totalTokens: number;

  constructor(stepHistory: StepHistory, totalTokens: number) {
    this.stepHistory = stepHistory;
    this.totalTokens = totalTokens;
  }

  getStepHistory() {
    return this.stepHistory;
  }

  getTotalTokens() {
    return this.totalTokens;
  }
}
