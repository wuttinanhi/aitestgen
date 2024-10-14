import { argsArrayToStringParse } from "../helpers/utils";
import { IStep } from "../interfaces/step";

export class PuppeteerTestGen {
  private steps: IStep[];
  private templateCode: string;
  private browserVar: string;
  private pageVar: string = "page";
  private generatedCode: string = ``;

  constructor(
    steps: IStep[],
    templateCode: string,
    templatePuppeteerLaunchVariableName: string,
    templatePuppeteerPageVariableName: string
  ) {
    this.steps = steps;
    this.templateCode = templateCode;
    this.browserVar = templatePuppeteerLaunchVariableName;
    this.pageVar = templatePuppeteerPageVariableName;

    this.sanitizeSteps();
  }

  sanitizeSteps() {
    // browser will always launch
    // if the first step is not launchBrowser, add it
    // if (this.steps[0].methodName !== "launchBrowser") {
    //   this.steps.unshift({ methodName: "launchBrowser", args: [] });
    // }

    // if the last step is not closeBrowser, add it
    if (this.steps[this.steps.length - 1].methodName !== "closeBrowser") {
      this.steps.push({ methodName: "closeBrowser", args: [] });
    }
  }

  /**
   * generate
   */
  public generate() {
    for (const step of this.steps) {
      const line = this.generateStep(step);
      this.generatedCode += line + "\n";
      // console.log(line);
    }
    return this.templateCode.replace("{{GENERATED_CODE}}", this.generatedCode);
  }

  protected generateStep(step: IStep) {
    const stepName = step.methodName;
    const stepArgs =
      step.args === undefined ? "" : argsArrayToStringParse(step.args);

    const arg0 = step.args[0] || "";
    const arg1 = step.args[1] || "";

    const varName0 = step.variables ? step.variables[0] : "";

    switch (step.methodName) {
      case "launchBrowser":
        // return `await ${this.pageVar}.launchBrowser();`;
        return ``;
      case "switchTab":
        return `await ${this.browserVar}.switchTab(${stepArgs});`;
      case "closeBrowser":
        return `await ${this.browserVar}.close();`;
      case "navigateTo":
        return `
await ${this.pageVar}.goto("${arg0}");
        `;
      case "clickElement":
        return `
var ${varName0} = await page.$("${arg0}");
if (!${varName0}) {
  throw new Error(\`Element not found: \$\{"${arg0}"\}\`);
}
await ${varName0}.click();`;
      case "setInputValue":
        return `
var inputElement = await page.$("${arg0}");
if (!inputElement) {
  throw new Error(\`Element not found: \$\{"${arg0}"\}\`);
}

await inputElement.type("${arg1}");`;
      case "getInputValue":
        return `const inputValue = await ${this.pageVar}.getInputValue(${stepArgs});`;
      case "setOptionValue":
        return `await ${this.pageVar}.setOptionValue(${stepArgs});`;
      case "expectElementVisible":
        if (arg1 == "true") {
          return `
var ${varName0} = await page.$("${arg0}");
if (!${varName0}) {
  throw new Error(\`Expect element visible: \$\{"${arg0}"\}\`);
}else{
  console.log(\`✅ Expect element visible: \$\{"${arg0}"\} is correct\`);
}
`;
        } else {
          return `
var ${varName0} = await page.$("${arg0}");
if (${varName0}) {
  throw new Error(\`Expect element not visible: \$\{"${arg0}"\}\`);
}else{
  console.log(\`✅ Expect element not visible: \$\{"${arg0}"\} is correct\`);
}
`;
        }
      case "expectElementText":
        return `
var ${varName0} = await page.$("${arg0}");
if (!${varName0}) {
  throw new Error(\`Element not found: \$\{"${arg0}"\}\`);
}

const ${varName0}_text = await ${varName0}.evaluate((e) => e.textContent);
if (${varName0}_text !== "${arg1}") {
  throw new Error(\`Expect text element: (\$\{"${arg0}"\}\) to be ${arg1} but got \$\{${varName0}_text\}\`);
}else{
  console.log(\`✅ Expect text element: (\$\{"${arg0}"\}\) to be ${arg1} is correct\`);    
}
`;
      case "waitForPageLoad":
        return `
  await Promise.race([
    ${this.pageVar}.waitForNavigation({
      waitUntil: "networkidle0",
      timeout: 10000,
    }),
    ${this.pageVar}.waitForNetworkIdle({
      timeout: 10000,
    }),
  ]);
          `;
      default:
        console.warn(
          `Step is not recognized: ${stepName} with args: ${stepArgs}`
        );
        return "";
    }
  }
}
