import { WebController } from "../../interfaces/controller.ts";
import { FrameData } from "../../interfaces/framedata.ts";
import { Step } from "../../interfaces/step.ts";
import { TestTranslator } from "../../interfaces/translator.ts";
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

export class SeleniumTranslator implements WebController, TestTranslator {
  private driverVar: string = "driver";
  private defaultDriverVar: string = "driver";
  private currentPageVar: string = "driver";

  private lastGetIframeData: FrameData[] = [];
  private iframeDepth: number = 0;
  private iframeVarStack: string[] = [];
  private getIframeVarStack: string[] = [];

  constructor() {}

  public async generate(steps: Step[]) {
    let generatedCode = "";

    for (const step of steps) {
      const line = await this.generateStep(step);
      generatedCode += line + "\n";
    }

    return generatedCode;
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

  async createSelectorVariable(params: TypeCreateSelectorVariableParams): Promise<any> {
    const selectorValue = params.selectorValue;
    const selectorType = params.selectorType;
    const varName = params.varName;

    let result: string;

    switch (selectorType) {
      case "css":
        result = `WebElement ${varName} = ${this.driverVar}.findElement(By.cssSelector("${selectorValue}"));`;
        break;
      case "xpath":
        result = `WebElement ${varName} = ${this.driverVar}.findElement(By.xpath("${selectorValue}"));`;
        break;
      case "id":
        result = `WebElement ${varName} = ${this.driverVar}.findElement(By.id("${selectorValue}"));`;
        break;
      default:
        throw new Error("Unknown selector type");
    }

    return result;
  }

  async clickElement(params: TypeClickElementParams): Promise<any> {
    const varSelector = params.varSelector;

    return `${varSelector}.click();`;
  }

  async setInputValue(params: TypeSetInputValueParams): Promise<any> {
    const varSelector = params.varSelector;
    const value = params.value;

    return `${varSelector}.sendKeys("${value}");`;
  }

  async expectElementVisible(params: TypeExpectElementVisibleParams): Promise<any> {
    const varSelector = params.varSelector;
    const visible = params.visible;

    if (visible == true) {
      return `Assertions.assertTrue(${varSelector}.isDisplayed(), "The element is not visible on the page.");`;
    } else {
      return `Assertions.assertFalse(${varSelector}.isDisplayed(), "The element is visible on the page.");`;
    }
  }

  async expectElementText(params: TypeExpectElementTextParams): Promise<any> {
    const varSelector = params.varSelector;
    const expectedText = params.expectedText;

    return `String text${varSelector} = ${varSelector}.getText();
assertEquals("${expectedText}", text${varSelector});
`;
  }

  async waitForPageLoad(params: any): Promise<any> {
    return `new WebDriverWait(driver, Duration.ofSeconds(10)).until(
webDriver -> ((JavascriptExecutor) webDriver).executeScript("return document.readyState").equals("complete")
);
`;
  }

  async launchBrowser(params: TypeLaunchBrowserParams): Promise<any> {
    // return "driver = new ChromeDriver();";
    return "";
  }

  async closeBrowser(params: TypeCloseBrowserParams): Promise<any> {
    return `${this.driverVar}.quit();`;
  }

  async navigateTo(params: TypeNavigateToParams): Promise<any> {
    const url = params.url;
    return `${this.driverVar}.get("${url}");`;
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
    return `await ${this.driverVar}.switchTab(${tabId});`;
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
      getMainframeFromVar = this.defaultDriverVar;
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
      last_iframeVar = this.defaultDriverVar;
    }

    const newIframeVar = `${last_iframeVar}_iframe${iframeIndex}`;

    iframeSwitch_code += `var ${newIframeVar} = ${latestGetIframeVar}[${iframeIndex}]\n`;

    this.iframeVarStack.push(newIframeVar);
    this.currentPageVar = newIframeVar;

    return iframeSwitch_code;
  }

  async iframeReset(params: TypeIframeResetParams): Promise<any> {
    this.currentPageVar = this.defaultDriverVar;

    return `${this.currentPageVar} = ${this.defaultDriverVar};`;
  }

  async quickSelector(params: TypeQuickSelectorParams): Promise<any> {
    return "";
  }

  pressKey(params: TypePressKeyParams): Promise<any> {
    throw new Error("Method not implemented.");
  }
}
