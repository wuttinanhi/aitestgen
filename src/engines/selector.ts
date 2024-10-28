import { ElementHandle } from "puppeteer";
import z from "zod";

export type SelectorType = "css" | "xpath" | "id";
// | "name" | "tag" | "class";

export const SelectorTypeZodEnum = z
  .enum(["css", "xpath", "id"])
  .describe("The type of the selector");

export class SelectorStorage {
  private selectorType: SelectorType;
  private selectorValue: string;
  private puppeteerSelector: ElementHandle;

  constructor(
    selectorType: SelectorType,
    selectorValue: string,
    puppeteerSelector: ElementHandle
  ) {
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

  public getEngineSelector() {
    return this.puppeteerSelector;
  }
}
