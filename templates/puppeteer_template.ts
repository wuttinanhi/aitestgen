import puppeteer, { Browser, Frame, Page } from "puppeteer";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

describe("TESTSUITE", () => {
  let browser: Browser;

  beforeEach(async () => {
    browser = await puppeteer.launch({
      headless: false,
      defaultViewport: {
        width: 1280,
        height: 720,
      },
    });
  });

  afterEach(async () => {
    await browser.close();
  });

  it("TESTCASE_1", async () => {
    let page = await browser.newPage();

    // {{GENERATED_CODE}}
  });
});
