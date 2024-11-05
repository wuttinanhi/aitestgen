import { readFileString } from "../../helpers/files";

export const DEFAULT_PUPPETEER_TEMPLATE = async () => readFileString(`${__dirname}/puppeteer.template.ts`);

export * from "./puppeteer.translator";
