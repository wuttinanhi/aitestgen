// deno-lint-ignore-file require-await no-unused-vars no-explicit-any no-empty
import * as puppeteer from "puppeteer";
import {
  BrowserAlreadyLaunchedError,
  BrowserNotLaunchedError,
  ElementBySelectorNotFoundError,
  ElementNotFoundError,
  PageNotFoundError,
} from "../errors/controller.ts";
import { HTMLStripNonDisplayTags } from "../helpers/html.ts";
import { sleep } from "../helpers/utils.ts";
import { WebController } from "../interfaces/controller.ts";
import { FrameData } from "../interfaces/framedata.ts";
import { SelectorStorage } from "../selectors/selector.ts";
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
} from "../tools/defs.ts";

export class PuppeteerController implements WebController {
  private isHeadless: boolean = true;
  private verbose: boolean = false;

  private browser: puppeteer.Browser | null = null;
  private activePage: puppeteer.Page | puppeteer.Frame | null = null;

  private isInRootFrame: boolean = true;

  private varNameToSelectorMap: Record<string, SelectorStorage> = {};

  public setHeadless(headless: boolean) {
    this.isHeadless = headless;
  }

  public setVerbose(verbose: boolean) {
    this.verbose = verbose;
  }

  getActivePage(): puppeteer.Page | puppeteer.Frame {
    if (!this.browser) {
      throw new BrowserNotLaunchedError();
    }

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

  async getSelectorStorageFromVariableName(selectorVarName: string) {
    const selector = this.varNameToSelectorMap[selectorVarName];
    if (!selector) {
      throw new ElementNotFoundError();
    }

    return selector;
  }

  // async waitForNavigation() {
  //   try {
  //     await this.getActivePage().waitForNavigation({
  //       waitUntil: "networkidle0",
  //       timeout: 5_000,
  //     });
  //   } catch (error) {}
  // }

  async waitForPageLoad() {
    try {
      await Promise.race([
        this.getActivePage().waitForNavigation({ waitUntil: "load", timeout: 5 * 1000 }),
        sleep(5 * 1000),
      ]);
    } catch (_) {
      if (this.verbose) {
        console.log("No navigation detected or wait time exceeded.");
      }
    }
  }

  async launchBrowser(_: TypeLaunchBrowserParams): Promise<void> {
    if (this.browser) {
      throw new BrowserAlreadyLaunchedError();
    }

    this.browser = await puppeteer.launch({
      headless: this.isHeadless,
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
    await this.getActivePage().goto(params.url);
  }

  async getHtmlSource(_: TypeGetHtmlSourceParams): Promise<any> {
    const content = await this.getActivePage().content();
    const htmlSmall = HTMLStripNonDisplayTags(content);

    // const innerText = await this.getActivePage().evaluate(() => {
    //   return document.body.innerText;
    // });

    if (this.verbose) {
      console.log("getHtmlSource Length", htmlSmall.length);
    }

    return {
      url: this.getActivePage().url(),
      html: htmlSmall,
      // textOnly: innerText,
    };
  }

  async clickElement(params: TypeClickElementParams): Promise<any> {
    const element = (await this.getSelectorStorageFromVariableName(params.varSelector)).getSelector();

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
    const element = (await this.getSelectorStorageFromVariableName(params.varSelector))
      .getSelector();

    // set input to empty first
    await element.evaluate((el) => {
      (el as HTMLInputElement).value = "";
    });

    // focus the element
    await element.focus();

    // type the value
    await element.type(String(params.value));
  }

  async expectElementVisible(params: TypeExpectElementVisibleParams): Promise<any> {
    // prettier-ignore
    const element = (await this.getSelectorStorageFromVariableName(params.varSelector))
      .getSelector();

    const isVisible = element !== null && (await element.boundingBox()) !== null;

    return {
      evaluate_result: isVisible === params.visible,
    };
  }

  async expectElementText(params: TypeExpectElementTextParams) {
    try {
      // prettier-ignore
      const selectorStorage = await this.getSelectorStorageFromVariableName(params.varSelector)
      const element = selectorStorage.getSelector();

      const elementText = await element.evaluate((el) => el.textContent);

      return {
        evaluate_result: elementText === params.expectedText,
      };
    } catch (error) {
      console.error(error);
    }
  }

  async getCurrentUrl(_: TypeGetCurrentUrlParams): Promise<string> {
    return this.getActivePage().url();
  }

  async getInputValue(params: TypeGetInputValueParams): Promise<string> {
    // prettier-ignore
    const element = (await this.getSelectorStorageFromVariableName(params.varSelector))
      .getSelector();

    return element.evaluate((el) => (el as HTMLInputElement).value).catch(() => "");
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
    const element = (await this.getSelectorStorageFromVariableName(params.varSelector))
      .getSelector();
    await element.select(params.value);
  }

  async getOptionValue(params: TypeGetOptionValueParams): Promise<string> {
    // prettier-ignore
    const element = (await this.getSelectorStorageFromVariableName(params.varSelector))
      .getSelector();
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
      const iframeAsPage: puppeteer.Page = contentFrame as any;
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
    } catch (_error) {
      // do nothing
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
    const page = this.getActivePage() as puppeteer.Page;
    await page.goBack();
  }

  async goForwardHistory(): Promise<void> {
    const page = this.getActivePage() as puppeteer.Page;
    await page.goForward();
  }

  async createSelectorVariable(params: TypeCreateSelectorVariableParams) {
    const page: puppeteer.Page = this.getActivePage() as puppeteer.Page;
    if (!page) {
      throw new PageNotFoundError();
    }

    const selectorValue = params.selectorValue;
    const selectorType = params.selectorType;
    const varNameInTest = params.varName;

    const defaultOptions: puppeteer.WaitForSelectorOptions = {
      timeout: 5 * 1000,
    };

    let selectorResult: any | null = null;
    switch (selectorType) {
      case "css":
        selectorResult = await page.waitForSelector(selectorValue, defaultOptions);
        break;
      case "xpath":
        selectorResult = await page.waitForSelector(`::-p-xpath(${selectorValue})`, defaultOptions);
        break;
      case "id":
        selectorResult = await page.waitForSelector(`#${selectorValue}`, defaultOptions);
        break;
      // case "name":
      //   selectorResult = await page.waitForSelector(`[name="${selectorValue}"]`);
      //   break;
      // case "tag":
      //   selectorResult = await page.waitForSelector(selectorValue);
      //   break;
      // case "class":
      //   selectorResult = await page.waitForSelector(`.${selectorValue}`);
      // break;
      default:
        throw new Error("Unknown selector type " + selectorType);
    }

    if (!selectorResult) {
      throw new ElementBySelectorNotFoundError(selectorType, selectorValue);
    }

    const storage = new SelectorStorage(selectorType, selectorValue, selectorResult);
    this.varNameToSelectorMap[varNameInTest] = storage;

    return;
  }
}
