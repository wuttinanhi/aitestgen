import { readFileString } from "../src/helpers/files";

export const DEFAULT_PUPPETEER_TEMPLATE = async () => readFileString(`${__dirname}/puppeteer_template.ts`);
