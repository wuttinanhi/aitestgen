import { readFileString } from "../helpers/files";

export * from "./puppeteer/puppeteer.translator";

export const DEFAULT_PUPPETEER_TEMPLATE = async () => readFileString(`${__dirname}/puppeteer.template.ts`);
