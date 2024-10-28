import puppeteer, { Browser, Frame, Page } from "puppeteer";
import { HTMLStripNonDisplayTags } from "../helpers/html";
import { sleep } from "../helpers/utils";
import { FrameData } from "../interfaces/FrameData";
import {
  TypeClickElementParams,
  TypeCloseBrowserParams,
  TypeCloseTabParams,
  TypeCreateSelectorVariableParams,
  TypeExpectElementTextParams,
  TypeExpectElementVisibleParams,
  TypeGetCurrentUrlParams,
  TypeGetHtmlSourceParams,
  TypeGetInputValueParams,
  TypeGetOptionValueParams,
  TypeGetTabsParams,
  TypeIframeGetDataParams,
  TypeIframeResetParams,
  TypeIframeSwitchParams,
  TypeLaunchBrowserParams,
  TypeNavigateToParams,
  TypeSetInputValueParams,
  TypeSetOptionValueParams,
  TypeSetTabParams,
} from "../tools/defs";
import {
  BrowserAlreadyLaunchedError,
  ElementNotFoundError,
  PageNotFoundError,
} from "./errors";
import { WebTestFunctionCall } from "./interfaces";
import { SelectorStorage } from "./selector";

export class PuppeteerEngine implements WebTestFunctionCall {
  private browser: Browser | null = null;
  private activePage: Page | Frame | null = null;

  private isInRootFrame: boolean = true;

  private varNameToSelectorMap: Record<string, SelectorStorage> = {};

  getActivePage(): Page | Frame {
    const page = this.activePage;
    if (!page) throw new PageNotFoundError();
    return page;
  }

  getBrowser() {
    const browser = this.browser;
    if (!browser) throw new Error("Browser not found");
    return browser;
  }

  async getLatestTab() {
    const tabs = await this.getBrowser().pages();
    return tabs.at(-1);
  }

  async getElement(selectorVarName: string) {
    const selector = this.varNameToSelectorMap[selectorVarName];
    if (!selector) {
      throw new ElementNotFoundError();
    }

    return selector;
  }

  async waitForNavigation() {
    try {
      await this.getActivePage().waitForNavigation({
        waitUntil: "networkidle0",
        timeout: 5_000,
      });
    } catch (error) {}
  }

  async waitForPageLoad() {
    try {
      await Promise.race([
        this.waitForNavigation(),
        // wait for network idle is not exist in frame
        // this.getActivePage().waitForNetworkIdle({
        //   timeout: 5_000,
        // }),
        // Hard limit of 10 seconds
        sleep(10_000),
      ]);
    } catch (error) {}
  }

  async launchBrowser(_: TypeLaunchBrowserParams): Promise<void> {
    if (this.browser) {
      throw new BrowserAlreadyLaunchedError();
    }

    this.browser = await puppeteer.launch({
      headless: false,
      defaultViewport: {
        width: 1280,
        height: 720,
      },
      // start in maximized window
      // defaultViewport: null,
      // args: ["--start-maximized"],
    });

    this.activePage = await this.browser.newPage();
  }

  async navigateTo(params: TypeNavigateToParams): Promise<void> {
    console.log(params);
    await this.getActivePage().goto(params.url);
  }

  async getHtmlSource(_: TypeGetHtmlSourceParams): Promise<any> {
    const content = await this.getActivePage().content();
    const htmlSmall = HTMLStripNonDisplayTags(content);

    // const innerText = await this.getActivePage().evaluate(() => {
    //   return document.body.innerText;
    // });

    console.log("HTML Source Length", htmlSmall.length);

    return {
      url: this.getActivePage().url(),
      html: htmlSmall,
      // textOnly: innerText,
    };
  }

  async clickElement(params: TypeClickElementParams): Promise<any> {
    // prettier-ignore
    const element = (await this.getElement(params.varSelector)).getEngineSelector();

    const beforeURL = this.getActivePage().url();

    await element.click();

    await this.waitForPageLoad();

    const afterURL = this.getActivePage().url();

    const pageChanged = beforeURL !== afterURL;
    return {
      pageChanged,
      beforeURL,
      afterURL,
    };
  }

  async setInputValue(params: TypeSetInputValueParams): Promise<any> {
    // prettier-ignore
    const element = (await this.getElement(params.varSelector)).getEngineSelector();

    // set input to empty first
    await element.evaluate((el) => {
      (el as HTMLInputElement).value = "";
    });

    // focus the element
    await element.focus();

    // type the value
    await element.type(String(params.value));
  }

  async expectElementVisible(
    params: TypeExpectElementVisibleParams
  ): Promise<any> {
    // prettier-ignore
    const element = (await this.getElement(params.varSelector)).getEngineSelector();

    const isVisible =
      element !== null && (await element.boundingBox()) !== null;

    return {
      evaluate_result: isVisible === params.visible,
    };
  }

  async expectElementText(params: TypeExpectElementTextParams) {
    // prettier-ignore
    const element = (await this.getElement(params.varSelector)).getEngineSelector();

    const elementText = await element.evaluate((el) => el.textContent);

    return {
      evaluate_result: elementText === params.expectedText,
    };
  }

  // async pressKey(key: KeyInput): Promise<void> {
  //   const frame = (await this.getActivePage()) as Page;
  //   frame.keyboard.press(key);
  //   // keyboard.press(key as any);
  // }

  async getCurrentUrl(_: TypeGetCurrentUrlParams): Promise<string> {
    return this.getActivePage().url();
  }

  async getInputValue(params: TypeGetInputValueParams): Promise<string> {
    // prettier-ignore
    const element = (await this.getElement(params.varSelector)).getEngineSelector();

    return element
      .evaluate((el) => (el as HTMLInputElement).value)
      .catch(() => "");
  }

  async getTabs(_: TypeGetTabsParams): Promise<any> {
    const tabs = await this.getBrowser().pages();
    return tabs.map((tab, i) => {
      return {
        index: i,
        pageURL: tab.url(),
      };
    });
  }

  async setTab(params: TypeSetTabParams): Promise<void> {
    const tabs = await this.getBrowser().pages();
    const tab = tabs[params.tabId];
    await tab.bringToFront();
  }

  async closeTab(params: TypeCloseTabParams): Promise<void> {
    const tabs = await this.getBrowser().pages();
    const tab = tabs[params.tabId];
    await tab.close();
    const latestTab = await this.getLatestTab();
    if (!latestTab) {
      throw new Error("No latest tab found. the browser is closed?");
    }
    this.activePage = latestTab;
  }

  async setOptionValue(params: TypeSetOptionValueParams): Promise<any> {
    // prettier-ignore
    const element = (await this.getElement(params.varSelector)).getEngineSelector();
    await element.select(params.value);
  }

  async getOptionValue(params: TypeGetOptionValueParams): Promise<string> {
    // prettier-ignore
    const element = (await this.getElement(params.varSelector)).getEngineSelector();
    const value = await element.evaluate((el) => {
      return (el as HTMLSelectElement).value;
    });
    return value;
  }

  async iframeGetData(_: TypeIframeGetDataParams): Promise<any> {
    const iframes = await this.getActivePage().$$("iframe");

    const iframDataArr: FrameData[] = [];

    for (const iframe of iframes) {
      const contentFrame = await iframe.contentFrame();

      const i: number = iframDataArr.length;
      const iframe_src_url = await iframe.evaluate((e) => e.src);
      const iframeAsPage: Page = contentFrame as any;
      // const text = await iframeAsPage.evaluate(() => document.body.innerText);
      // const composed_css_selector = await element2selector(iframe as any);

      iframDataArr.push({
        index: i,
        iframe_src_url,
        _internalPage: iframeAsPage,
      });
    }

    return iframDataArr;
  }

  async iframeSwitch(params: TypeIframeSwitchParams): Promise<void> {
    if (this.isInRootFrame) {
      this.isInRootFrame = false;
    }

    const iframes = await this.iframeGetData({});
    const iframe = iframes.at(params.index);
    if (!iframe) {
      throw new Error(`iframe switch at index ${params.index} not found`);
    }

    this.activePage = iframe._internalPage;
  }

  async iframeReset(_: TypeIframeResetParams): Promise<void> {
    const latestTab = await this.getLatestTab();
    if (!latestTab) {
      throw new Error("No latest tab found. the browser is closed?");
    }

    this.activePage = latestTab;
    this.isInRootFrame = true;

    // this.activePage = this.lastPageBeforeEnterIframe;
    // this.currentCSSSelector = [];
  }

  async closeBrowser(_: TypeCloseBrowserParams): Promise<void> {
    try {
      await this.iframeReset({});
    } catch (error) {
      console.warn("Error resetting iframe", error);
    }

    const browser = this.browser;
    if (!browser) {
      throw new Error("Browser already closed");
    }

    await browser.close();
    this.browser = null;
  }

  async complete(): Promise<void> {
    return;
  }

  async reset(): Promise<void> {
    await this.closeBrowser({});
    await this.launchBrowser({});
  }

  async goBackHistory(): Promise<void> {
    const page = this.getActivePage() as Page;
    await page.goBack();
  }

  async goForwardHistory(): Promise<void> {
    const page = this.getActivePage() as Page;
    await page.goForward();
  }

  async createSelectorVariable(params: TypeCreateSelectorVariableParams) {
    let page: Page = this.getActivePage() as Page;
    if (!page) {
      throw new PageNotFoundError();
    }

    const selectorValue = params.selectorValue;
    const selectorType = params.selectorType;
    const varNameInTest = params.varName;

    let engineSelector: any | null = null;
    switch (selectorType) {
      case "css":
        engineSelector = await page.waitForSelector(selectorValue);
        break;
      case "xpath":
        // prettier-ignore
        engineSelector = await page.waitForSelector( `::-p-xpath(${selectorValue})`);
        break;
      case "id":
        engineSelector = await page.waitForSelector(`#${selectorValue}`);
        break;
      // case "name":
      //   engineSelector = await page.waitForSelector(`[name="${selectorValue}"]`);
      //   break;
      // case "tag":
      //   engineSelector = await page.waitForSelector(selectorValue);
      //   break;
      // case "class":
      //   engineSelector = await page.waitForSelector(`.${selectorValue}`);
      // break;
      default:
        throw new Error("Unknown selector type");
    }

    if (!engineSelector) {
      throw new ElementNotFoundError();
    }

    const storage = new SelectorStorage(
      selectorType,
      selectorValue,
      engineSelector
    );
    this.varNameToSelectorMap[varNameInTest] = storage;

    return;
  }
}
