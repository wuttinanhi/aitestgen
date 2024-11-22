import { WebController } from "../../interfaces/controller.ts";
import { writeFileString } from "../../helpers/files.ts";
import { formatTypescriptCode } from "../../helpers/formatter.ts";
import { FrameData } from "../../interfaces/framedata.ts";
import { Step } from "../../interfaces/step.ts";
import {
  TypeClickElementParams,
  TypeCloseBrowserParams,
  TypeCloseTabParams,
  TypeCompleteParams,
  TypeCreateSelectorVariableParams,
  TypeExpectElementTextParams,
  TypeExpectElementVisibleParams,
  TypeGetCurrentUrlParams,
  TypeGetHtmlSourceParams,
  TypeGetInputValueParams,
  TypeGetOptionValueParams,
  TypeGetTabsParams,
  TypeGoBackHistoryParams,
  TypeGoForwardHistoryParams,
  TypeIframeGetDataParams,
  TypeIframeResetParams,
  TypeIframeSwitchParams,
  TypeLaunchBrowserParams,
  TypeNavigateToParams,
  TypePressKeyParams,
  TypeQuickSelectorParams,
  TypeResetParams,
  TypeSetInputValueParams,
  TypeSetOptionValueParams,
  TypeSetTabParams,
} from "../../tools/defs.ts";
import { TestTranslator } from "../../interfaces/translator.ts";

export class PuppeteerTranslator implements WebController, TestTranslator {
  private browserVar: string;
  private defaultPageVar: string = "page";
  private currentPageVar: string = "page";

  private lastGetIframeData: FrameData[] = [];
  private iframeDepth: number = 0;
  private iframeVarStack: string[] = [];
  private getIframeVarStack: string[] = [];

  constructor(templateBrowserVar: string, templatePageVar: string) {
    this.browserVar = templateBrowserVar;
    this.defaultPageVar = templatePageVar;
    this.currentPageVar = templatePageVar;
  }

  public async generate(steps: Step[]) {
    let generatedCode = "";

    for (const step of steps) {
      const line = await this.generateStep(step);
      generatedCode += line + "\n";
    }

    return generatedCode;
  }

  public async generateToFile(steps: Step[], templateCode: string, templateGenCodePlaceholder: string, outFilePath: string) {
    // generate the test code
    let generatedTestCode = await this.generate(steps);

    // replace template code
    const replaceTemplateCode = templateCode.replace(templateGenCodePlaceholder, generatedTestCode);

    // try formatting the generated code
    let formattedCode = await formatTypescriptCode(replaceTemplateCode);

    // save to file
    await writeFileString(outFilePath, formattedCode);
  }

  protected async generateStep(step: Step) {
    const stepName = step.methodName;
    const stepArgs = step.functionArgs;

    if (stepName === "iframeGetData") {
      this.lastGetIframeData = step.iframeGetDataResult;
    }

    // invoke self method
    const result = await (this as any)[stepName as any](stepArgs);

    return result;
  }

  async launchBrowser(params: TypeLaunchBrowserParams): Promise<any> {
    return "";
  }

  async closeBrowser(params: TypeCloseBrowserParams): Promise<any> {
    return `await ${this.browserVar}.close();`;
  }

  async reset(params: TypeResetParams): Promise<any> {
    return "";
  }

  async complete(params: TypeCompleteParams): Promise<any> {
    return "";
  }

  async getCurrentUrl(params: TypeGetCurrentUrlParams): Promise<any> {
    return "";
  }

  async getHtmlSource(params: TypeGetHtmlSourceParams): Promise<any> {
    return "";
  }

  async clickElement(params: TypeClickElementParams): Promise<any> {
    const varSelector = params.varSelector;

    return `await ${varSelector}!.click();`;
  }

  async setInputValue(params: TypeSetInputValueParams): Promise<any> {
    const varSelector = params.varSelector;
    const value = params.value;

    return `await ${varSelector}!.type("${value}");`;
  }

  async getInputValue(params: TypeGetInputValueParams): Promise<any> {
    return "";
  }

  async setOptionValue(params: TypeSetOptionValueParams): Promise<any> {
    const varSelector = params.varSelector;
    const value = params.value;

    return `await ${varSelector}.setOptionValue(${value});`;
  }

  async getOptionValue(params: TypeGetOptionValueParams): Promise<any> {
    return "";
  }

  async expectElementVisible(params: TypeExpectElementVisibleParams): Promise<any> {
    const varSelector = params.varSelector;
    const visible = params.visible;

    if (visible == true) {
      return `expect(${varSelector}).not.toBeNull();`;
    } else {
      return `expect(${varSelector}).toBeNull();`;
    }
  }

  async expectElementText(params: TypeExpectElementTextParams): Promise<any> {
    const varSelector = params.varSelector;
    const expectedText = params.expectedText;

    return `
     const ${varSelector}_text = await ${varSelector}!.evaluate((e) => e.textContent);
     expect(${varSelector}_text).toBe("${expectedText}");
     `;
  }

  async navigateTo(params: TypeNavigateToParams): Promise<any> {
    const url = params.url;
    return `await ${this.currentPageVar}.goto("${url}")`;
  }

  async goBackHistory(params: TypeGoBackHistoryParams): Promise<any> {
    return `await ${this.currentPageVar}.goBack();`;
  }

  async goForwardHistory(params: TypeGoForwardHistoryParams): Promise<any> {
    return `await ${this.currentPageVar}.goForward();`;
  }

  async getTabs(params: TypeGetTabsParams): Promise<any> {
    return "";
  }

  async setTab(params: TypeSetTabParams): Promise<any> {
    const tabId = params.tabId;
    return `await ${this.browserVar}.switchTab(${tabId});`;
  }

  async closeTab(params: TypeCloseTabParams): Promise<any> {
    const tabId = params.tabId;
    return `// CLOSE TAB ${tabId}`;
  }

  async iframeGetData(params: TypeIframeGetDataParams): Promise<any> {
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
  }

  async iframeSwitch(params: TypeIframeSwitchParams): Promise<any> {
    const iframeIndex = Number(params.index);

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
  }

  async iframeReset(params: TypeIframeResetParams): Promise<any> {
    this.currentPageVar = this.defaultPageVar;

    return `${this.currentPageVar} = ${this.defaultPageVar};`;
  }

  async waitForPageLoad(params: any): Promise<any> {
    return `
    async function waitForNavigation() {
      try {
        await ${this.currentPageVar}.waitForNavigation({
          waitUntil: "networkidle0",
        });
      } catch (error) {}
    }
      
    await waitForNavigation();
    `;
  }

  async createSelectorVariable(params: TypeCreateSelectorVariableParams): Promise<any> {
    const selectorValue = params.selectorValue;
    const selectorType = params.selectorType;
    const varNameInTest = params.varName;

    let result: string;

    switch (selectorType) {
      case "css":
        result = `var ${varNameInTest} = await ${this.currentPageVar}.waitForSelector(\`${selectorValue}\`);`;
        break;
      case "xpath":
        // prettier-ignore
        result = `var ${varNameInTest} = await ${this.currentPageVar}.waitForSelector(\`::-p-xpath(${selectorValue})\`);`
        break;
      case "id":
        result = `var ${varNameInTest} = await ${this.currentPageVar}.waitForSelector(\`#${selectorValue}\`);`;
        break;
      default:
        throw new Error("Unknown selector type");
    }

    return result;
  }

  async quickSelector(params: TypeQuickSelectorParams): Promise<any> {
    return "";
  }

  async pressKey(params: TypePressKeyParams): Promise<any> {
    return `await ${this.currentPageVar}.keyboard.press("${params.key}");`;
  }
}
