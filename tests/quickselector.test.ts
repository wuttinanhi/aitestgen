import { writeFileString } from "src/helpers/files.ts";
import { test } from "vitest";
import { PuppeteerController } from "../src/controllers/puppeteer.controller.ts";

test("should get all selectors", async () => {
  const webController = new PuppeteerController();
  webController.setVerbose(true);

  await webController.launchBrowser({});

  // await webController.navigateTo({ url: "https://microsoftedge.github.io/Demos/demo-to-do" });
  await webController.navigateTo({ url: "https://www.youtube.com/results?search_query=rickroll" });
  // await webController.navigateTo({ url: "https://stripe-checkout-next-js-demo.vercel.app" });

  const quickSelectorResult = await webController.quickSelector({});

  await writeFileString(".debug", quickSelectorResult);

  await webController.closeBrowser({});
});
