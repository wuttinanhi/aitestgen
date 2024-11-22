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

  private lastGetIframeData: FrameData[] = [];
  private iframeDepth: number = 0;
  private iframeVarStack: string[] = [];
  private getIframeVarStack: string[] = [];

  constructor() {}

  public async generate(steps: Step[]) {
    let generatedCode = "";

    for (const [index, step] of steps.entries()) {
      // if step 0 is launchBrowser then ignore it
      // because we already launch browser in BeforeEach
      if (index === 0 && step.methodName === "launchBrowser") {
        continue;
      }

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
    return "driver = new ChromeDriver();";
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

    return `Select select${varSelector} = new Select(dropdown);
select${varSelector}.selectByValue(value);`;
  }

  async getOptionValue(params: TypeGetOptionValueParams): Promise<any> {
    return "";
  }

  async goBackHistory(params: TypeGoBackHistoryParams): Promise<any> {
    return `${this.driverVar}.navigate().back();`;
  }

  async goForwardHistory(params: TypeGoForwardHistoryParams): Promise<any> {
    return `${this.driverVar}.navigate().forward();`;
  }

  async getTabs(params: TypeGetTabsParams): Promise<any> {
    return "";
  }

  protected haveDeclaredTabsVariable = false;

  protected createTabVariable() {
    if (this.haveDeclaredTabsVariable) {
      return `tabs = new ArrayList<>(${this.driverVar}.getWindowHandles());`;
    } else {
      return `List<String> tabs = new ArrayList<>(${this.driverVar}.getWindowHandles());`;
    }
  }

  async setTab(params: TypeSetTabParams): Promise<any> {
    const tabId = params.tabId;
    let out = this.createTabVariable();

    out += `${this.driverVar}.switchTo().window(tabs.get(${tabId}));`;

    return out;
  }

  async closeTab(params: TypeCloseTabParams): Promise<any> {
    const tabId = params.tabId;

    let out = this.createTabVariable();

    out += `${this.driverVar}.switchTo().window(tabs.get(${tabId}));
${this.driverVar}.close();
${this.driverVar}.switchTo().window(tabs.get(tabs.size() - 1)); // switch to latest tab
`;

    return out;
  }

  async iframeGetData(params: TypeIframeGetDataParams): Promise<any> {
    return "// TODO: implements iframeGetData";
  }

  async iframeSwitch(params: TypeIframeSwitchParams): Promise<any> {
    return "// TODO: implements iframeSwitch";
  }

  async iframeReset(params: TypeIframeResetParams): Promise<any> {
    return "// TODO: implements iframeReset";
  }

  async quickSelector(params: TypeQuickSelectorParams): Promise<any> {
    return "";
  }

  async pressKey(params: TypePressKeyParams): Promise<any> {
    const keyboardKey = String(params.key).toUpperCase();

    return `Actions actions = new Actions(driver);
actions.sendKeys(Keys.${keyboardKey}).perform();`;
  }
}
