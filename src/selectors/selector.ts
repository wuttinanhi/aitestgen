import { ElementHandle } from "puppeteer";

export type SelectorType = "css" | "xpath" | "id";
// | "name" | "tag" | "class";

export class SelectorStorage {
  private selectorType: SelectorType;
  private selectorValue: string;
  private puppeteerSelector: ElementHandle;

  constructor(selectorType: SelectorType, selectorValue: string, puppeteerSelector: ElementHandle) {
    this.selectorType = selectorType;
    this.selectorValue = selectorValue;
    this.puppeteerSelector = puppeteerSelector;
  }

  public getSelectorType(): SelectorType {
    return this.selectorType;
  }

  public getSelectorValue(): string {
    return this.selectorValue;
  }

  public getSelector() {
    return this.puppeteerSelector;
  }
}
