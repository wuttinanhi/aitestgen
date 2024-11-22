export * from "./puppeteer/puppeteer.translator.ts";

import { readFileSync } from "node:fs";
import path from "path";
import { fileURLToPath } from "url";
import { PuppeteerTranslator } from "./puppeteer/puppeteer.translator.ts";

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

export const DEFAULT_PUPPETEER_TEMPLATE = readFileSync(`${__dirname}/puppeteer/puppeteer.template.ts`, "utf-8");

export function getTranslator(translatorName: string) {
  switch (translatorName) {
    case "puppeteer":
      return new PuppeteerTranslator("browser", "page");
    default:
      throw new Error(`Unknown translator: ${translatorName}`);
  }
}

export function getTemplateByTranslatorName(translatorName: string) {
  switch (translatorName) {
    case "puppeteer":
      return DEFAULT_PUPPETEER_TEMPLATE;
    default:
      throw new Error(`Template unknown translator: ${translatorName}`);
  }
}
