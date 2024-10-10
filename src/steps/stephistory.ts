import { readFileString, writeFileString } from "../helpers/files";
import { argsArrayToStringParse } from "../helpers/utils";
import { IStep } from "../interfaces/step";

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
   * generateTestOnSelectedStep
   */
  public async generateTestOnSelectedStep(selectedStepIndex: number[]) {
    console.log("generating test on selected steps", selectedStepIndex);

    const selectedSteps = this.steps.filter((_, index) =>
      selectedStepIndex.includes(index)
    );
    // console.log("selectedSteps length", selectedSteps.length);

    // append `browser.` to each method name
    const browserSelectedSteps = selectedSteps.map((step) => {
      const parsedArgs = argsArrayToStringParse(step.methodArguments);
      return `await browser.${step.methodName}(${parsedArgs});`;
    });

    // console.log("browserSelectedSteps length", browserSelectedSteps.length);
    for (const codeLine of browserSelectedSteps) {
      console.log(codeLine);
    }

    const templateFile = await readFileString("src/templates/template.ts");

    // replace `// <REPLACE TEST STEPS> ` with browserSelectedSteps.join("\n")
    const replaced = templateFile.replace(
      "// <REPLACE TEST STEPS>",
      browserSelectedSteps.join("\n")
    );

    // write the replaced content to src/test_generated.ts
    await writeFileString("src/test_generated.ts", replaced);
  }
}
