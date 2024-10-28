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

    await page.goto("https://microsoftedge.github.io/Demos/demo-to-do/");

    var newTaskInput = await page.waitForSelector(`#new-task`);
    var submitButton = await page.waitForSelector(`input[type='submit']`);
    await newTaskInput!.type("Feed the dog");
    await submitButton!.click();
    await newTaskInput!.type("Learn to code");
    await submitButton!.click();
    await newTaskInput!.type("Cook dinner");
    await submitButton!.click();
  });
});
