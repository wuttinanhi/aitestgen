export * from "./puppeteer/puppeteer.translator.ts";

import { readFileSync } from "node:fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

export const DEFAULT_PUPPETEER_TEMPLATE = readFileSync(`${__dirname}/puppeteer/puppeteer.template.ts`, "utf-8");
