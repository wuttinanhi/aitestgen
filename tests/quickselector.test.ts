import { expect, test } from "vitest";
import { PuppeteerController } from "../src/controllers/puppeteer.controller.ts";
import { BaseMessage } from "@langchain/core/messages";
import { TestStepGenerator } from "../src/generators/generator.ts";
import { DEFAULT_SYSTEM_FINALIZE_PROMPT, DEFAULT_SYSTEM_INSTRUCTION_PROMPT } from "../src/prompts/index.ts";
import { readFileString, writeFileString } from "../src/helpers/files.ts";
import { PuppeteerTranslator } from "../src/translators/puppeteer/puppeteer.translator.ts";
import { DEFAULT_PUPPETEER_TEMPLATE } from "../src/translators/index.ts";
import { formatTSCode } from "../src/helpers/formatter.ts";
import { getOpenAIModel } from "../src/models/wrapper.ts";
import { runVitest } from "../src/helpers/tester.ts";

test("should get all selectors", async () => {
  const webController = new PuppeteerController();

  await webController.launchBrowser({});

  await webController.navigateTo({
    url: "https://toolbox.googleapps.com/apps/dig/",
  });

  const result = await webController.quickSelector({});

  console.log(result);

  console.log(result.length);

  expect(result.length).toEqual(67);

  await webController.closeBrowser({});
});
