import { expect, test } from "vitest";
import { PuppeteerController } from "../src/controllers/puppeteer.controller.ts";

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
