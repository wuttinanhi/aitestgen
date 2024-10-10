import puppeteer, { Browser, Page } from "puppeteer";
import { WebTestFunctionCall } from "../functions/interfaces";
import { readFileString, writeFileString } from "../helpers/files";
import { HTMLStripNonDisplayTags } from "../helpers/html";
import { sleep } from "../helpers/utils";

class PuppeteerWebTest implements WebTestFunctionCall {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private functionCalls: string[] = [];

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
    this.page = await this.browser.newPage();
    await sleep(2000);
  }

  async navigateTo(url: string): Promise<void> {
    if (this.page) {
      await this.page.goto(url);
      try {
        await Promise.race([
          this.page.waitForNavigation({
            waitUntil: "networkidle0",
            timeout: 10000,
          }),
          this.page.waitForNetworkIdle({
            timeout: 10000,
          }),
          sleep(12000),
        ]);
      } catch (error) {}
    }
  }

  async getHtmlSource(): Promise<string> {
    if (this.page) {
      const content = await this.page.content();
      const htmlSmall = HTMLStripNonDisplayTags(content);
      return htmlSmall;
    }
    return "";
  }

  async validateElement(selector: string): Promise<boolean> {
    if (this.page) {
      const element = await this.page.$(selector);
      return element !== null;
    }
    return false;
  }

  async clickElement(selector: string): Promise<any> {
    if (this.page) {
      const selectedElement = await this.page.$(selector);
      if (selectedElement) {
        const beforeURL = this.page.url();

        await selectedElement.click();

        // wait either network idle or page change or wait a bit
        try {
          await Promise.race([
            this.page.waitForNavigation({
              waitUntil: "networkidle0",
              timeout: 10000,
            }),
            this.page.waitForNetworkIdle({
              timeout: 10000,
            }),
            sleep(12000),
          ]);
        } catch (error) {}

        const afterURL = this.page.url();
        const pageChanged = beforeURL !== afterURL;
        return {
          status: "success",
          pageChanged,
          beforeURL,
          afterURL,
        };
      } else {
        return {
          status: "error",
          message: "Element not found",
        };
      }
    }
  }

  async typeText(selector: string, text: string): Promise<void> {
    if (this.page) {
      await this.page.type(selector, text);
    }
  }

  async setInputValue(selector: string, value: any): Promise<any> {
    if (this.page) {
      const selectedElement = await this.page.$(selector);
      if (selectedElement) {
        // set input to empty first
        await selectedElement.evaluate((el) => {
          (el as HTMLInputElement).value = "";
        });

        // type the value
        await selectedElement.type(value);
      } else {
        return {
          status: "error",
          message: "Element not found",
        };
      }
    }
  }

  async expectElementVisible(
    selector: string,
    visible: boolean
  ): Promise<boolean> {
    if (this.page) {
      const element = await this.page.$(selector);
      const isVisible =
        element !== null && (await element.boundingBox()) !== null;
      return isVisible === visible;
    }
    return false;
  }

  async expectElementText(selector: string, text: string): Promise<boolean> {
    if (this.page) {
      const element = await this.page.$(selector);

      if (element) {
        const elementText = await element.evaluate((el) => el.textContent);

        return elementText === text;
      } else {
        return false;
      }
    }
    return false;
  }

  async pressKey(key: string): Promise<void> {
    if (this.page) {
      await this.page.keyboard.press(key as any);
    }
  }

  async getCurrentUrl(): Promise<string> {
    if (this.page) {
      return this.page.url();
    }
    return "";
  }

  async getInputValue(selector: string): Promise<string> {
    if (this.page) {
      return this.page
        .$eval(selector, (el) => (el as HTMLInputElement).value)
        .catch(() => "");
    }
    return "";
  }

  async closeBrowser(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
    }
  }

  appendWebTestFunctionCall(call: string): void {
    // if (call.startsWith("expect")) {
    //   this.functionCalls.push(`const expectResult = await browser.${call}`);
    //   this.functionCalls.push("console.log(expectResult);");
    // } else {
    //   this.functionCalls.push(`await browser.${call}`);
    // }
    this.functionCalls.push(`await browser.${call}`);
  }

  displayWebTestFunctionCalls(): void {
    console.log(this.functionCalls.join("\n"));
  }

  async complete(): Promise<void> {
    this.appendWebTestFunctionCall("closeBrowser()");
    this.displayWebTestFunctionCalls();

    // read file at src/templates/template.ts
    const template = await readFileString("src/templates/template.ts");

    // replace `// <REPLACE TEST STEPS>` with this.functionCalls.join("\n")
    const replaced = template.replace(
      "// <REPLACE TEST STEPS>",
      this.functionCalls.join("\n")
    );

    // write the replaced content to src/generated.ts
    await writeFileString("src/generated.ts", replaced);
  }
}

export default PuppeteerWebTest;
