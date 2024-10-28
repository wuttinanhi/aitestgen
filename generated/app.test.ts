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

    const taskInput = await page.waitForSelector(`#new-task`);
    const submitButton = await page.waitForSelector(`input[type='submit']`);
    const taskList = await page.waitForSelector(`#tasks`);
    await taskInput!.type("Feed the dog");
    await submitButton!.click();
    await taskInput!.type("Learn to code");
    await submitButton!.click();
    await taskInput!.type("Cook dinner");
    await submitButton!.click();

    expect(taskList).not.toBeNull();

    expect(taskList).not.toBeNull();
    await browser.close();
  });
});
