export * from "./puppeteer/puppeteer.translator.ts";

import { readFileSync } from "node:fs";
import path from "path";
import { fileURLToPath } from "url";
import { PuppeteerTranslator } from "./puppeteer/puppeteer.translator.ts";

export function getTranslator(translatorName: string) {
  switch (translatorName) {
    case "puppeteer":
      return new PuppeteerTranslator();
    default:
      throw new Error(`Unknown translator: ${translatorName}`);
  }
}
