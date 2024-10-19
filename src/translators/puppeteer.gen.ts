import { argsArrayToStringParse } from "../helpers/utils";
import { FrameData } from "../interfaces/FrameData";
import { IStep } from "../interfaces/Step";
import { StepHistory } from "../steps/stephistory";

export class PuppeteerTestTranslator {
  private steps: IStep[];
  private templateCode: string;
  private browserVar: string;
  private defaultPageVar: string = "page";
  private currentPageVar: string = "page";
  private templatePlaceholder: string = "{{GENERATED_CODE}}";
  private generatedCode: string = ``;
  private lastGetIframeData: FrameData[] = [];
  private iframeDepth: number = 0;

  constructor(
    stepHistory: StepHistory,
    templateCode: string,
    templatePuppeteerLaunchVariableName: string,
    templatePuppeteerPageVariableName: string,
    templatePlaceholder: string
  ) {
    this.steps = stepHistory.listSteps();
    this.templateCode = templateCode;
    this.browserVar = templatePuppeteerLaunchVariableName;
    this.defaultPageVar = templatePuppeteerPageVariableName;
    this.currentPageVar = templatePuppeteerPageVariableName;
    this.templatePlaceholder = templatePlaceholder;

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
  public async generate() {
    for (const step of this.steps) {
      const line = await this.generateStep(step);
      this.generatedCode += line + "\n";
      // console.log(line);
    }

    return this.templateCode.replace(
      this.templatePlaceholder,
      this.generatedCode
    );
  }

  protected async generateStep(step: IStep) {
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
await ${this.currentPageVar}.goto("${arg0}");
        `;
      case "clickElement":
        return `
var ${varName0} = await ${this.currentPageVar}.$("${arg0}");
expect(${varName0}).not.toBeNull();
await ${varName0}!.click();`;
      case "setInputValue":
        return `
var ${varName0} = await ${this.currentPageVar}.$("${arg0}");
expect(${varName0}).not.toBeNull();

await ${varName0}!.type("${arg1}");`;
      case "getInputValue":
        return `const inputValue = await ${this.currentPageVar}.getInputValue(${stepArgs});`;
      case "setOptionValue":
        return `await ${this.currentPageVar}.setOptionValue(${stepArgs});`;
      case "expectElementVisible":
        if ((arg1 as any) == true) {
          // console.log(\`✅ Expect element visible: \$\{"${arg0}"\} is correct\`);
          return `
var ${varName0} = await ${this.currentPageVar}.$("${arg0}");
expect(${varName0}).not.toBeNull();`;
        } else {
          // console.log(\`✅ Expect element not visible: \$\{"${arg0}"\} is correct\`);
          return `
var ${varName0} = await ${this.currentPageVar}.$("${arg0}");
expect(${varName0}).toBeNull();`;
        }

      case "expectElementText":
        // console.log(\`✅ Expect text element: (\$\{"${arg0}"\}\) to be "${arg1}"\`);
        return `
var ${varName0} = await ${this.currentPageVar}.$("${arg0}");
expect(${varName0}).not.toBeNull();

const ${varName0}_text = await ${varName0}!.evaluate((e) => e.textContent);
expect(${varName0}_text).toBe("${arg1}");`;

      case "waitForPageLoad":
        return `
  // wait for page load
  await Promise.race([
    ${this.currentPageVar}.waitForNavigation({
      waitUntil: "networkidle0",
      timeout: 10000,
    }),
    ${this.currentPageVar}.waitForNetworkIdle({
      timeout: 10000,
    }),
  ]);
          `;
      case "pressKey":
        return `
await ${this.currentPageVar}.keyboard.press("${arg0}");
`;

      case "getHtmlSource":
        return ``;

      case "iframeGetData":
        this.lastGetIframeData = step.iframeGetDataResult;
        this.iframeDepth += 1;
        return `var baseFrame = ${this.defaultPageVar}.mainFrame();`;

      case "iframeSwitch":
        const iframeIndex = Number(arg0);

        let out = ``;

        for (let i = 0; i < this.iframeDepth; i++) {
          const prevFrameVar = i === 0 ? "baseFrame" : `iframe_${i - 1}`;
          const newFrameVar = `iframe_${i}`;

          if (i === 0) {
            out += `var ${newFrameVar} = baseFrame.childFrames()[${iframeIndex}]\n`;
          } else {
            out += `var ${newFrameVar} = ${prevFrameVar}.childFrames()[${iframeIndex}]\n`;
          }

          this.currentPageVar = newFrameVar;
        }

        return out;

      case "iframeReset":
        return `
// reset to main frame
${this.currentPageVar} = ${this.defaultPageVar};
`;

      default:
        console.warn(
          `Step is not recognized: ${stepName} with args: ${stepArgs}`
        );
        return "";
    }
  }
}
