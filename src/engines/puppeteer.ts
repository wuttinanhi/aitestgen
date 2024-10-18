import puppeteer, { Browser, Page } from "puppeteer";
import { HTMLStripNonDisplayTags } from "../helpers/html";
import { sleep } from "../helpers/utils";
import {
  BrowserAlreadyLaunchedError,
  ElementNotFoundError,
  PageNotFoundError,
} from "./errors";
import { WebTestFunctionCall } from "./interfaces";

export class PuppeteerEngine implements WebTestFunctionCall {
  private browser: Browser | null = null;
  private activePage: Page | null = null;
  private lastPageBeforeEnterIframe: Page | null = null;
  private isInRootFrame: boolean = true;

  getActivePage() {
    const page = this.activePage;
    if (!page) throw new PageNotFoundError();
    return page;
  }

  getBrowser() {
    const browser = this.browser;
    if (!browser) throw new Error("Browser not found");
    return browser;
  }

  async getElement(selector: string) {
    const selectedElement = await this.getActivePage().$(selector);
    if (!selectedElement) {
      throw new ElementNotFoundError();
    }
    return selectedElement;
  }

  async waitForPageLoad() {
    return Promise.race([
      this.getActivePage().waitForNavigation({
        waitUntil: "load",
        timeout: 5_000,
      }),
      this.getActivePage().waitForNetworkIdle({
        timeout: 5_000,
      }),
      sleep(10_000),
    ]);
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
    return {
      url: this.getActivePage().url(),
      html: htmlSmall,
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

    // wait either network idle or page change or wait a bit
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

  async pressKey(key: string): Promise<void> {
    await this.getActivePage().keyboard.press(key as any);
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
    this.activePage = tabs[0];
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
    const data = await iframeTraveler(this.getActivePage(), [], 0);
    return data;

    // const iframes = await this.getActivePage().$$("iframe");
    // const data = [];
    // let i = 0;

    // for (const iframe of iframes) {
    //   // prettier-ignore
    //   const iframe_src = await iframe.evaluate((el) => (el as HTMLIFrameElement).src);

    //   data.push({
    //     index: i,
    //     iframe_src,
    //     selector: `iframe:nth-child(${i + 1})`,
    //   });
    //   i++;
    // }

    // return data;
  }

  async iframeSwitch(id: any): Promise<void> {
    if (this.isInRootFrame) {
      this.lastPageBeforeEnterIframe = this.activePage;
      this.isInRootFrame = false;
    }

    const iframes = await this.iframeGetData();
    this.activePage = iframes[id]._internalPage;
  }

  async iframeReset(): Promise<void> {
    this.activePage = this.lastPageBeforeEnterIframe;
    this.isInRootFrame = true;
  }

  async closeBrowser(): Promise<void> {
    await this.browser!.close();
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
    await this.getActivePage().goBack();
  }

  async goForwardHistory(): Promise<void> {
    await this.getActivePage().goForward();
  }
}

export async function iframeTraveler(
  page: Page,
  dataArrBuffer: any[],
  depth: number
) {
  if (depth >= 5) {
    return;
  }

  const iframes = await page.$$("iframe");

  for (const iframe of iframes) {
    const contentFrame = await iframe.contentFrame();

    // prettier-ignore
    const iframe_src = await iframe.evaluate((el) => (el as HTMLIFrameElement).src);
    const i: number = dataArrBuffer.length;
    const iframeAsPage: Page = contentFrame as any;
    const text = await iframeAsPage.evaluate(() => document.body.innerText);
    // const htmlSource = await contentFrame.content();

    dataArrBuffer.push({
      index: i,
      iframe_src,
      depth,
      _internalPage: iframeAsPage,
      text,
      // htmlSource,
    });

    // console.log("iurl", contentFrame.url());

    // const page = contentFrame.page();
    // if (!page) {
    //   console.warn("Iframe page not found");
    //   continue;
    // }

    await iframeTraveler(iframeAsPage, dataArrBuffer, depth + 1);
  }

  return dataArrBuffer;
}
