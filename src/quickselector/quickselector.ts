import { ElementHandle, Page } from "puppeteer";
import { element2selector } from "puppeteer-element2selector";
import { QuickSelectorElement } from "src/interfaces/controller.ts";

export class QuickSelector {
  protected primedElements: QuickSelectorElement[] = [];

  constructor() {}

  public async processPage(page: Page) {
    // for (const tag of QUICK_SELECTOR_ALLOWED_TAGS) {
    //   const elements = await page.$$(tag);
    // }

    const pageElements = await page.$$("*");
    console.log(`total elements in page: ${pageElements.length}`);

    const waitGroup: Promise<void>[] = [];

    for (const element of pageElements) {
      //   const tagName = await this.getTagName(element);
      //   console.log("page tagname", tagName);

      waitGroup.push(this.filterElement(element));
    }

    await Promise.allSettled(waitGroup);
  }

  protected async getElementChilds(parentElement: ElementHandle<Element>) {
    let childElements = await parentElement.$$(":scope > *");
    return childElements;
  }

  protected async filterElement(element: ElementHandle<Element>) {
    const tagName = await this.getTagName(element);

    // if tag name is not in allowed list then ignore
    // if (!QUICK_SELECTOR_ALLOWED_TAGS.includes(tagName)) {
    //   return;
    // }

    // if tag is non displayable then ignore
    if (["script", "style"].includes(tagName)) {
      return;
    }

    // if tag is a, input, button always include
    if (["a", "input", "button"].includes(tagName)) {
      await this.addToPrimeElements(element);
      return;
    }

    // if element have childs then ignore and process childs instead
    const childElements = await this.getElementChilds(element);
    if (childElements.length > 0) {
      //   for (const child of childElements) {
      //     await this.filterElement(child);
      //   }

      return;
    }

    // if tag is not input or button then check for text content
    let textContent = "";

    if (!["input", "button"].includes(tagName)) {
      const textContent = await this.getTextContent(element);

      // if text content too long or empty then ignore
      if (textContent.length > 10_000 || textContent.length === 0) {
        return;
      }
    }

    // finally add element to primed elements array
    await this.addToPrimeElements(element);
  }

  public getResult() {
    return this.primedElements;
  }

  protected async getTagName(element: ElementHandle<Element>) {
    let tagName = await element.evaluate((e) => e.tagName);
    tagName = String(tagName).toLowerCase();
    return tagName;
  }

  protected async getTextContent(element: ElementHandle<Element>) {
    let textContent = await element.evaluate((el) => {
      return el.textContent ? el.textContent : "";
    });
    textContent = String(textContent).trim();
    return textContent;
  }

  protected async addToPrimeElements(element: ElementHandle<Element>) {
    let tagName = await this.getTagName(element);
    let textContent = await this.getTextContent(element);
    let cssSelector = await element2selector(element as any);

    this.primedElements.push({
      tag: tagName,
      textElement: textContent,
      cssSelector: cssSelector,
      childs: [],
    });
  }
}
