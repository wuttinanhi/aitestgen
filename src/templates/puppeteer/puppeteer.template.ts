import puppeteer, { Browser, Frame, Page } from "puppeteer";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

describe("// {{TESTSUITE_NAME}}", () => {
  let browser: Browser;

  beforeEach(async () => {
    browser = await puppeteer.launch({
      headless: true,
      defaultViewport: {
        width: 1280,
        height: 720,
      },
    });
  });

  afterEach(async () => {
    await browser.close();
  });

  // --- START TESTCASE ---
  it("// {{TESTCASE_NAME}}", async () => {
    let page = await browser.newPage();

    // {{TESTCASE_GENERATED_CODE}}
  });

  // --- END TESTCASE ---

  // {{TESTCASES}}
});
