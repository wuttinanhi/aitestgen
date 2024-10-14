import { readFileString, writeFileString } from "../helpers/files";
import { formatCode } from "../helpers/formatter";
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
    console.log("generating test on selected steps", ...selectedStepIndex);

    const selectedSteps = this.steps.filter((_, index) =>
      selectedStepIndex.includes(index)
    );
    // console.log("selectedSteps length", selectedSteps.length);

    // check if first step is launchBrowser if not add as first step
    if (
      selectedSteps.length === 0 ||
      selectedSteps[0].methodName !== "launchBrowser"
    ) {
      selectedSteps.unshift({
        methodName: "launchBrowser",
        args: [],
      });
    }

    // check if last step is closeBrowser if not add as last step
    if (
      selectedSteps.length === 0 ||
      selectedSteps[selectedSteps.length - 1].methodName !== "closeBrowser"
    ) {
      selectedSteps.push({
        methodName: "closeBrowser",
        args: [],
      });
    }

    // append `browser.` to each method name
    let expectVariableIndex = 1;
    const browserSelectedSteps = selectedSteps.map((step) => {
      const parsedArgs = argsArrayToStringParse(step.args);
      const codeLine = `await browser.${step.methodName}(${parsedArgs});`;

      // if contains expect
      // then create variable name
      if (step.methodName.includes("expect")) {
        const variableName = `expect_${expectVariableIndex++}`;
        const variableCodeLine = `const ${variableName} = ${codeLine}\nconsole.log(${variableName});\n`;
        return variableCodeLine;
      }

      return codeLine;
    });

    // console.log("browserSelectedSteps length", browserSelectedSteps.length);
    for (const codeLine of browserSelectedSteps) {
      console.log(codeLine);
    }

    const templateFile = await readFileString("src/template.ts");

    // replace `// <REPLACE TEST STEPS> ` with browserSelectedSteps.join("\n")
    const replaced = templateFile.replace(
      "// <REPLACE TEST STEPS>",
      browserSelectedSteps.join("\n")
    );

    const formattedCode = await formatCode(replaced);

    // write the replaced content to src/test_generated.ts
    await writeFileString("src/test_generated.ts", formattedCode);
  }

  toJSONString() {
    return JSON.stringify(this.steps);
  }
}
