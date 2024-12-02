import { test } from "vitest";
import { PuppeteerController } from "../src/controllers/puppeteer.controller.ts";

test("should get all selectors", async () => {
  const webController = new PuppeteerController();

  await webController.launchBrowser({});

  await webController.navigateTo({ url: "https://microsoftedge.github.io/Demos/demo-to-do" });

  const result = await webController.quickSelector({});

  console.log(result);

  await webController.closeBrowser({});
});
