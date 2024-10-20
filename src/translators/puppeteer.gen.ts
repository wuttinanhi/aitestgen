import { argsArrayToStringParse } from "../helpers/utils";
import { FrameData } from "../interfaces/FrameData";
import { IStep } from "../interfaces/Step";
import { StepHistory } from "../steps/stephistory";

// export interface IframeNode {
//   id: string;
//   parent: PageOrFrame | null;
//   childs: PageOrFrame[];
// }

export class PuppeteerTestTranslator {
  private steps: IStep[];

  private browserVar: string;
  private defaultPageVar: string = "page";
  private currentPageVar: string = "page";

  private templateCode: string;
  private templatePlaceholder: string = "{{GENERATED_CODE}}";
  private generatedCode: string = ``;

  private lastGetIframeData: FrameData[] = [];
  private iframeDepth: number = 0;
  private iframeVarStack: string[] = [];
  private getIframeVarStack: string[] = [];

  // private iframeTree: IframeNode[] = [];

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

        let getMainframeFromVar = "";
        let new_Get_Iframe_Var = "";
        let getFrames_code = "";

        if (this.iframeVarStack.length === 0) {
          getMainframeFromVar = this.defaultPageVar;
          new_Get_Iframe_Var = "baseFrame";
          getFrames_code = `var rootFrame = ${getMainframeFromVar}.mainFrame();
var ${new_Get_Iframe_Var} = rootFrame.childFrames();`;
        } else {
          // prettier-ignore
          getMainframeFromVar = this.iframeVarStack[this.iframeVarStack.length - 1];
          new_Get_Iframe_Var = `${getMainframeFromVar}_childFrames`;
          getFrames_code = `var ${new_Get_Iframe_Var} = ${getMainframeFromVar}.childFrames();`;
        }

        this.getIframeVarStack.push(new_Get_Iframe_Var);

        return getFrames_code;

      case "iframeSwitch":
        const iframeIndex = Number(arg0);

        let iframeSwitch_code = ``;

        let latestGetIframeVar = this.getIframeVarStack.at(-1);

        let last_iframeVar = this.iframeVarStack.at(-1);
        if (last_iframeVar === undefined) {
          last_iframeVar = this.defaultPageVar;
        }

        const newIframeVar = `${last_iframeVar}_iframe${iframeIndex}`;

        iframeSwitch_code += `var ${newIframeVar} = ${latestGetIframeVar}[${iframeIndex}]\n`;

        this.iframeVarStack.push(newIframeVar);
        this.currentPageVar = newIframeVar;

        return iframeSwitch_code;

      case "iframeReset":
        this.currentPageVar = this.defaultPageVar;

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
