import { IStep } from "../interfaces/step";

export class PuppeteerTestGen {
  private steps: IStep[];
  private templateCode: string;
  private pVar: string;
  private generatedCode: string = ``;

  constructor(
    steps: IStep[],
    templateCode: string,
    templatePuppeteerLaunchVariableName: string
  ) {
    this.steps = steps;
    this.templateCode = templateCode;
    this.pVar = templatePuppeteerLaunchVariableName;
  }

  /**
   * generate
   */
  public generate() {
    for (const step of this.steps) {
      this.generatedCode += this.generateStep(step);
    }
  }

  generateStep(step: IStep) {
    switch (step.methodName) {
      case "launchBrowser":
        return `await ${this.pVar}.launchBrowser();\n`;
      case "closeBrowser":
        return `await ${this.pVar}.closeBrowser();\n`;
      case "navigateTo":
        return `await ${this.pVar}.navigateTo(${step.args[0]});\n`;
      case "clickElement":
        return `await ${this.pVar}.clickElement(${step.args[0]});\n`;
      case "setInputValue":
        return `await ${this.pVar}.setInputValue(${step.args[0]}, ${step.args[1]});\n`;
      case "getInputValue":
        return `const inputValue = await ${this.pVar}.getInputValue(${step.args[0]});\n`;
      case "setOptionValue":
        return `await ${this.pVar}.setOptionValue(${step.args[0]}, ${step.args[1]});\n`;
      case "expectElementVisible":
        return `const isVisible = await ${this.pVar}.expectElementVisible(${step.args[0]}, ${step.args[1]});
console.log("Element is visible: ", ${step.args[1]}, isVisible);`;
      case "expectElementText":
        return `await ${this.pVar}.expectElementText(${step.args[0]}, ${step.args[1]});\n`;
      case "complete":
        return `await ${this.pVar}.complete();\n`;
      default:
        break;
    }
  }
}
