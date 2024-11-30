// deno-lint-ignore-file require-await no-unused-vars no-explicit-any no-empty
import * as puppeteer from "puppeteer";
import { element2selector } from "puppeteer-element2selector";
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
  TypeCompleteParams,
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
  TypePressKeyParams,
  TypeQuickSelectorParams,
  TypeResetParams,
  TypeSetInputValueParams,
  TypeSetOptionValueParams,
  TypeSetTabParams,
} from "../tools/defs.ts";

export class PuppeteerController implements WebController {
  protected isHeadless: boolean = true;
  protected verbose: boolean = false;

  protected browser: puppeteer.Browser | null = null;
  protected activePage: puppeteer.Page | puppeteer.Frame | null = null;

  protected isInRootFrame: boolean = true;

  protected varNameToSelectorMap: Record<string, SelectorStorage> = {};

  public setHeadless(headless: boolean) {
    this.isHeadless = headless;
  }

  public setVerbose(verbose: boolean) {
    this.verbose = verbose;
  }

  protected getActivePage(): puppeteer.Page | puppeteer.Frame {
    if (!this.browser) {
      throw new BrowserNotLaunchedError();
    }

    const page = this.activePage;
    if (!page) throw new PageNotFoundError();
    return page;
  }

  protected getBrowser() {
    const browser = this.browser;
    if (!browser) throw new Error("Browser not found");
    return browser;
  }

  public async getLatestTab() {
    const tabs = await this.getBrowser().pages();
    return tabs.at(-1);
  }

  public async getSelectorStorageFromVariableName(selectorVarName: string) {
    const selector = this.varNameToSelectorMap[selectorVarName];
    if (!selector) {
      throw new ElementNotFoundError();
    }

    return selector;
  }

  public async waitForPageLoad() {
    try {
      await Promise.race([this.getActivePage().waitForNavigation({ waitUntil: "load", timeout: 5 * 1000 }), sleep(5 * 1000)]);
    } catch (_) {
      if (this.verbose) {
        console.log("No navigation detected or wait time exceeded.");
      }
    }
  }

  public async launchBrowser(_: TypeLaunchBrowserParams): Promise<any> {
    if (this.browser) {
      throw new BrowserAlreadyLaunchedError();
    }

    this.browser = await puppeteer.launch({
      headless: this.isHeadless,
      defaultViewport: {
        width: 800,
        height: 600,
      },
      // start in maximized window
      // defaultViewport: null,
      // args: ["--start-maximized"],
    });

    this.activePage = await this.browser.newPage();
  }

  public async navigateTo(params: TypeNavigateToParams): Promise<any> {
    await this.getActivePage().goto(params.url);
    await this.waitForPageLoad();

    const newURL = this.getActivePage().url();
    return newURL;
  }

  public async getHtmlSource(_: TypeGetHtmlSourceParams) {
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

  public async clickElement(params: TypeClickElementParams) {
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

  public async setInputValue(params: TypeSetInputValueParams): Promise<any> {
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

  public async expectElementVisible(params: TypeExpectElementVisibleParams): Promise<any> {
    const element = (await this.getSelectorStorageFromVariableName(params.varSelector)).getSelector();

    const isVisible = element !== null && (await element.boundingBox()) !== null;

    return { evaluate_result: isVisible === params.visible };
  }

  public async expectElementText(params: TypeExpectElementTextParams): Promise<any> {
    const selectorStorage = await this.getSelectorStorageFromVariableName(params.varSelector);
    const element = selectorStorage.getSelector();

    const elementText = await element.evaluate((el: any) => el.textContent);

    return {
      evaluate_result: elementText === params.expectedText,
    };
  }

  public async getCurrentUrl(_: TypeGetCurrentUrlParams): Promise<any> {
    return this.getActivePage().url();
  }

  public async getInputValue(params: TypeGetInputValueParams): Promise<any> {
    const element = (await this.getSelectorStorageFromVariableName(params.varSelector)).getSelector();

    return element.evaluate((el) => (el as HTMLInputElement).value).catch(() => "");
  }

  public async getTabs(_: TypeGetTabsParams) {
    const tabs = await this.getBrowser().pages();
    return tabs.map((tab, i) => {
      return { index: i, pageURL: tab.url() };
    });
  }

  public async setTab(params: TypeSetTabParams): Promise<any> {
    const tabs = await this.getBrowser().pages();
    const tab = tabs[params.tabId];
    await tab.bringToFront();
  }

  public async closeTab(params: TypeCloseTabParams): Promise<any> {
    const tabs = await this.getBrowser().pages();
    const tab = tabs[params.tabId];
    await tab.close();

    const latestTab = await this.getLatestTab();
    if (!latestTab) {
      throw new Error("No latest tab found. the browser is closed?");
    }

    this.activePage = latestTab;
  }

  public async setOptionValue(params: TypeSetOptionValueParams): Promise<any> {
    // prettier-ignore
    const element = (await this.getSelectorStorageFromVariableName(params.varSelector))
      .getSelector();
    await element.select(params.value);
  }

  public async getOptionValue(params: TypeGetOptionValueParams): Promise<any> {
    // prettier-ignore
    const element = (await this.getSelectorStorageFromVariableName(params.varSelector))
      .getSelector();
    const value = await element.evaluate((el) => {
      return (el as HTMLSelectElement).value;
    });
    return value;
  }

  public async iframeGetData(_: TypeIframeGetDataParams): Promise<any> {
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

  public async iframeSwitch(params: TypeIframeSwitchParams): Promise<any> {
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

  public async iframeReset(_: TypeIframeResetParams): Promise<any> {
    const latestTab = await this.getLatestTab();
    if (!latestTab) {
      throw new Error("No latest tab found. the browser is closed?");
    }

    this.activePage = latestTab;
    this.isInRootFrame = true;

    // this.activePage = this.lastPageBeforeEnterIframe;
    // this.currentCSSSelector = [];
  }

  public async closeBrowser(_: TypeCloseBrowserParams): Promise<any> {
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

  public async complete(params: TypeCompleteParams): Promise<any> {
    return;
  }

  public async reset(_: TypeResetParams): Promise<any> {
    await this.closeBrowser({});
    await this.launchBrowser({});
  }

  public async goBackHistory(): Promise<any> {
    const page = this.getActivePage() as puppeteer.Page;
    await page.goBack();
  }

  public async goForwardHistory(): Promise<any> {
    const page = this.getActivePage() as puppeteer.Page;
    await page.goForward();
  }

  public async createSelectorVariable(params: TypeCreateSelectorVariableParams): Promise<any> {
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

    return { created_variable: varNameInTest };
  }

  public async quickSelector(params: TypeQuickSelectorParams) {
    const tags = [
      "span",
      "strong",
      "em",
      "b",
      "i",
      "u",
      "mark",
      "small",
      "del",
      "ins",
      "code",
      "kbd",
      "s",
      "sub",
      "sup",
      "blockquote",
      "q",
      "cite",
      "abbr",
      "address",
      "pre",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "button",
      "input",
      "select",
      "option",
      "textarea",
      "label",
      // "fieldset",
      // "legend",
      "a",
      // "td",
    ];

    return getElementsWithSelectors(this.getActivePage() as puppeteer.Page, tags);
  }

  public async pressKey(params: TypePressKeyParams): Promise<any> {
    const page = this.getActivePage() as puppeteer.Page;
    await page.keyboard.press(params.key as any);
  }
}

async function getElementsWithSelectors(page: puppeteer.Page, tags: string[]) {
  const result = [];

  for (const tag of tags) {
    // const elements = document.querySelectorAll(tag);
    const elements = await page.$$(tag);

    for (const element of elements) {
      let cssSelector = await element2selector(element as any);

      const textContent = await element.evaluate((el) => {
        return el.textContent ? el.textContent.trim() : "";
      });

      result.push({
        type: tag,
        textElement: textContent,
        cssSelector: cssSelector,
      });
    }
  }

  return result;
}
