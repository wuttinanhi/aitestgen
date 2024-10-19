import puppeteer, { Browser, Frame, KeyInput, Page } from "puppeteer";
import { HTMLStripNonDisplayTags } from "../helpers/html";
import { sleep } from "../helpers/utils";
import { FrameData } from "../interfaces/FrameData";
import {
  BrowserAlreadyLaunchedError,
  ElementNotFoundError,
  PageNotFoundError,
} from "./errors";
import { WebTestFunctionCall } from "./interfaces";

export class PuppeteerEngine implements WebTestFunctionCall {
  private browser: Browser | null = null;
  private activePage: Page | Frame | null = null;

  private lastPageBeforeEnterIframe: Page | Frame | null = null;
  private isInRootFrame: boolean = true;
  // private currentCSSSelector = [];

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

  async getElement(selector: string) {
    const selectedElement = await this.getActivePage().$(selector);
    if (!selectedElement) {
      throw new ElementNotFoundError();
    }
    return selectedElement;
  }

  async waitForNavigation() {
    try {
      this.getActivePage().waitForNavigation({
        waitUntil: "load",
        timeout: 5_000,
      });
    } catch (error) {}
  }

  async waitForPageLoad() {
    try {
      return Promise.race([
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

  async launchBrowser(): Promise<void> {
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

  async navigateTo(url: string): Promise<void> {
    await this.getActivePage().goto(url);
  }

  async getHtmlSource(): Promise<any> {
    const content = await this.getActivePage().content();
    const htmlSmall = HTMLStripNonDisplayTags(content);

    // const innerText = await this.getActivePage().evaluate(() => {
    //   return document.body.innerText;
    // });

    return {
      url: this.getActivePage().url(),
      html: htmlSmall,
      // textOnly: innerText,
    };
  }

  async validateElement(selector: string): Promise<boolean> {
    const element = await this.getActivePage().$(selector);
    return element !== null;
  }

  async clickElement(selector: string, _: string): Promise<any> {
    const selectedElement = await this.getElement(selector);

    const beforeURL = this.getActivePage().url();
    await selectedElement.click();

    await this.waitForPageLoad();

    const afterURL = this.getActivePage().url();
    const pageChanged = beforeURL !== afterURL;

    return {
      pageChanged,
      beforeURL,
      afterURL,
    };
  }

  async setInputValue(selector: string, value: any): Promise<any> {
    const selectedElement = await this.getElement(selector);

    // set input to empty first
    await selectedElement.evaluate((el) => {
      (el as HTMLInputElement).value = "";
    });

    // type the value
    await selectedElement.type(value);
  }

  async expectElementVisible(
    selector: string,
    visible: boolean,
    _: string
  ): Promise<any> {
    const element = await this.getActivePage().$(selector);
    const isVisible =
      element !== null && (await element.boundingBox()) !== null;
    return {
      evaluate_result: isVisible === visible,
    };
  }

  async expectElementText(selector: string, text: string, _: string) {
    const selectedElement = await this.getElement(selector);

    const elementText = await selectedElement.evaluate((el) => el.textContent);

    return {
      evaluate_result: elementText === text,
    };
  }

  async pressKey(key: KeyInput): Promise<void> {
    const frame = (await this.getActivePage()) as Page;
    frame.keyboard.press(key);
    // keyboard.press(key as any);
  }

  async getCurrentUrl(): Promise<string> {
    return this.getActivePage().url();
  }

  async getInputValue(selector: string): Promise<string> {
    return this.getActivePage()
      .$eval(selector, (el) => (el as HTMLInputElement).value)
      .catch(() => "");
  }

  async getTabs(): Promise<any> {
    const tabs = await this.getBrowser().pages();
    return tabs.map((tab, i) => {
      return {
        index: i,
        pageURL: tab.url(),
      };
    });
  }

  async setTab(tabId: number): Promise<void> {
    const tabs = await this.getBrowser().pages();
    const tab = tabs[tabId];
    await tab.bringToFront();
  }

  async closeTab(tabId: number): Promise<void> {
    const tabs = await this.getBrowser().pages();
    const tab = tabs[tabId];
    await tab.close();
    const latestTab = await this.getLatestTab();
    if (!latestTab) {
      throw new Error("No latest tab found. the browser is closed?");
    }
    this.activePage = latestTab;
  }

  async setOptionValue(selector: string, value: any): Promise<any> {
    const selectedElement = await this.getElement(selector);
    await selectedElement.select(value);
  }

  async getOptionValue(selector: string): Promise<string> {
    const selectedElement = await this.getElement(selector);
    const value = await selectedElement.evaluate((el) => {
      return (el as HTMLSelectElement).value;
    });
    return value;
  }

  async iframeGetData(): Promise<any> {
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

  async iframeSwitch(index: any): Promise<void> {
    if (this.isInRootFrame) {
      this.lastPageBeforeEnterIframe = this.getActivePage();
      this.isInRootFrame = false;
    }

    const iframes = await this.iframeGetData();
    const iframe = iframes.at(index);
    if (!iframe) {
      throw new Error(`iframe switch at index ${index} not found`);
    }

    this.activePage = iframe._internalPage;
  }

  async iframeReset(): Promise<void> {
    const latestTab = await this.getLatestTab();
    if (!latestTab) {
      throw new Error("No latest tab found. the browser is closed?");
    }

    this.activePage = latestTab;
    this.isInRootFrame = true;

    // this.activePage = this.lastPageBeforeEnterIframe;
    // this.currentCSSSelector = [];
  }

  async closeBrowser(): Promise<void> {
    try {
      await this.iframeReset();
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
    await this.closeBrowser();
    await this.launchBrowser();
  }

  async goBackHistory(): Promise<void> {
    const page = this.getActivePage() as Page;
    await page.goBack();
  }

  async goForwardHistory(): Promise<void> {
    const page = this.getActivePage() as Page;
    await page.goForward();
  }
}
