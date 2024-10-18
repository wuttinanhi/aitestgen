import { IStep } from "../interfaces/Step";

export class StepHistory {
  private steps: IStep[] = [];

  constructor() {
    this.steps = [];
  }

  /**
   * createStep
   */
  public createStep(step: IStep) {
    this.steps.push(step);
  }

  /**
   * updateStep
   */
  public updateStep(stepIndex: number, step: IStep) {
    this.steps[stepIndex] = step;
  }

  /**
   * bulkDeleteSteps
   */
  public bulkDeleteSteps(stepIndexes: number[]) {
    this.steps = this.steps.filter((_, index) => !stepIndexes.includes(index));
  }

  /**
   * listSteps
   */
  public listSteps() {
    return this.steps;
  }

  /**
   * reset
   */
  public reset() {
    this.steps = [];
  }

  toJSONString() {
    return JSON.stringify(this.steps);
  }

  fromJSONString(jsonString: string) {
    this.steps = JSON.parse(jsonString);
  }
}
