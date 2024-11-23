export * from "./puppeteer/puppeteer.translator.ts";

import { PuppeteerTranslator } from "./puppeteer/puppeteer.translator.ts";
import { SeleniumTranslator } from "./selenium/selenium.translator.ts";

export function getTranslator(translatorName: string) {
  switch (translatorName) {
    case "puppeteer":
      return new PuppeteerTranslator();
    case "selenium":
      return new SeleniumTranslator();
    default:
      throw new Error(`Unknown translator: ${translatorName}`);
  }
}
