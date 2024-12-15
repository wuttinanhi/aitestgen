import { ElementHandle, Page } from "puppeteer";
import { element2selector } from "puppeteer-element2selector";
import { QuickSelectorElement } from "src/interfaces/controller.ts";

export class QuickSelector {
  protected filteredElements: ElementHandle<Element>[] = [];

  constructor() {}

  public async processPage(page: Page) {
    // get all elements in the page
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
    const [tagName, childElements, textContent, isDupe] = await Promise.all([
      this.getTagName(element),
      this.getElementChilds(element),
      this.getTextContent(element),
      this.checkDupe(this.filteredElements, element),
    ]);

    // if dupe element then ignore
    if (isDupe) {
      return;
    }

    // if tag is non displayable then ignore
    if (["script", "style", "noscript"].includes(tagName)) {
      return;
    }

    // if tag is a, input, button always include
    if (["a", "input", "button"].includes(tagName)) {
      this.addToPrimeElements(element);
      return;
    }

    // if element have childs then ignore and process childs instead

    if (childElements.length > 0) {
      //   for (const child of childElements) {
      //     await this.filterElement(child);
      //   }
      return;
    }

    // if tag is not input or button then check for text content
    if (!["input", "button"].includes(tagName)) {
      // if text content too long or empty then ignore
      if (textContent.length > 10_000 || textContent.length === 0) {
        return;
      }
    }

    // finally add element to primed elements array
    this.addToPrimeElements(element);
  }

  protected addToPrimeElements(element: ElementHandle<Element>) {
    this.filteredElements.push(element);
  }

  public async getResult() {
    return this.filteredElements;
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

  dupeSelector: string[] = [];

  protected async convertToQuickSelectorElement(element: ElementHandle<Element>) {
    const [tagName, textContent, cssSelector] = await Promise.all([
      this.getTagName(element),
      this.getTextContent(element),
      element2selector(element as any),
    ]);

    if (this.dupeSelector.includes(cssSelector)) {
      console.log("found dupe", cssSelector);
    }
    this.dupeSelector.push(cssSelector);

    return {
      tag: tagName,
      textElement: textContent,
      cssSelector: cssSelector,
    } as QuickSelectorElement;
  }

  protected async checkDupe(existedElements: ElementHandle<Element>[], elementToCheck: ElementHandle<Element>) {
    const isDuplicate = await Promise.any(
      existedElements.map((uniqueElement) => uniqueElement.evaluate((el, otherEl) => el === otherEl, elementToCheck)),
    ).catch(() => false); // Catch in case there are no duplicates

    return isDuplicate;
  }

  public async getResultQuickSelectorElement() {
    const result = await this.getResult();

    const waitPromises = result.map((e) => this.convertToQuickSelectorElement(e));
    const promiseResult = await Promise.all(waitPromises);

    console.log("getResultQuickSelectorElement total", promiseResult.length);

    return promiseResult;
  }
}
