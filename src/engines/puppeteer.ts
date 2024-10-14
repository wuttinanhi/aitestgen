import puppeteer, { Browser, Page } from "puppeteer";
import { HTMLStripNonDisplayTags } from "../helpers/html";
import { sleep } from "../helpers/utils";
import { ElementNotFoundError, PageNotFoundError } from "./errors";
import { WebTestFunctionCall } from "./interfaces";

export class PuppeteerWebTest implements WebTestFunctionCall {
  private browser: Browser | null = null;
  private activePage: Page | null = null;

  async newPage() {
    this.activePage = await this.browser!.newPage();
  }

  async getPages() {
    const pages = await this.browser!.pages();
    return pages.map((page, index) => {
      return {
        index,
        url: page.url(),
      };
    });
  }

  async setActivePageByIndex(index: number) {
    const pages = await this.browser!.pages();
    pages[index].bringToFront();
    this.activePage = pages[index];
  }

  async deletePage(index: number) {
    const pages = await this.browser!.pages();
    await pages[index].close();
    this.activePage = pages.at(-1)!;
  }

  getActivePage() {
    const page = this.activePage;
    if (!page) throw new PageNotFoundError();
    return page;
  }

  async waitForPageLoad() {
    return Promise.race([
      this.getActivePage().waitForNavigation({
        waitUntil: "networkidle0",
        timeout: 10000,
      }),
      this.getActivePage().waitForNetworkIdle({
        timeout: 10000,
      }),
      sleep(12000),
    ]);
  }

  async launchBrowser(): Promise<void> {
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
    await this.newPage();
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

  async clickElement(selector: string): Promise<any> {
    const selectedElement = await this.getActivePage().$(selector);
    if (!selectedElement) {
      throw new ElementNotFoundError();
    }

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

  async typeText(selector: string, text: string): Promise<void> {
    await this.getActivePage().type(selector, text);
  }

  async setInputValue(selector: string, value: any): Promise<any> {
    const selectedElement = await this.getActivePage().$(selector);
    if (!selectedElement) {
      throw new ElementNotFoundError();
    }

    // set input to empty first
    await selectedElement.evaluate((el) => {
      (el as HTMLInputElement).value = "";
    });

    // type the value
    await selectedElement.type(value);
  }

  async expectElementVisible(
    selector: string,
    visible: boolean
  ): Promise<boolean> {
    const element = await this.getActivePage().$(selector);
    const isVisible =
      element !== null && (await element.boundingBox()) !== null;
    return isVisible === visible;
  }

  async expectElementText(selector: string, text: string) {
    const selectedElement = await this.getActivePage().$(selector);
    if (!selectedElement) {
      throw new ElementNotFoundError();
    }

    const elementText = await selectedElement.evaluate((el) => el.textContent);

    return {
      result: elementText === text,
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

  setOptionValue(selector: string, value: any): Promise<any> {
    throw new Error("Method not implemented.");
  }

  getOptionValue(selector: string): Promise<string> {
    throw new Error("Method not implemented.");
  }

  wrapperGetInputs(): Promise<any> {
    throw new Error("Method not implemented.");
  }

  wrapperGetButtons(): Promise<any> {
    throw new Error("Method not implemented.");
  }

  getIframesData(): Promise<any> {
    throw new Error("Method not implemented.");
  }

  switchToIframe(selector: string): Promise<void> {
    throw new Error("Method not implemented.");
  }

  async closeBrowser(): Promise<void> {
    await this.browser!.close();
  }

  async complete(): Promise<void> {
    return;
  }
}
