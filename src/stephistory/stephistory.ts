import { Step } from "../interfaces/step.ts";

export class StepHistory {
  private steps: Step[] = [];
  private STEP_ID = 0;

  constructor() {
    this.steps = [];
  }

  /**
   * createStep
   */
  public createStep(step: Step) {
    step.stepId = this.STEP_ID++;
    this.steps.push(step);
  }

  public findStepById(stepId: number) {
    return this.steps.find((step) => step.stepId === stepId);
  }

  /**
   * updateStep
   */
  public updateStep(stepId: number, stepData: Step) {
    const step = this.findStepById(stepId);
    stepData.stepId = stepId;
    if (step) {
      Object.assign(step, stepData);
    }
  }

  /**
   * bulkDeleteSteps
   */
  public bulkDeleteSteps(stepIDs: number[]) {
    this.steps = this.steps.filter((step) => !stepIDs.includes(step.stepId!));
  }

  /**
   * listSteps
   */
  public getAll() {
    return this.steps;
  }

  /**
   * reset
   */
  public reset() {
    this.steps = [];
  }

  public pickStepByIds(stepIds: number[]) {
    return this.steps.filter((step) => stepIds.includes(step.stepId!));
  }

  public latestStep() {
    return this.steps[this.steps.length - 1];
  }

  toJSONString() {
    return JSON.stringify(this.steps);
  }

  fromJSONString(jsonString: string) {
    this.steps = JSON.parse(jsonString);
  }
}
