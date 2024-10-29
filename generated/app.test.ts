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

    await page.goto("http://localhost:3000");

    var nameInput = await page.waitForSelector(`#name`);
    var emailInput = await page.waitForSelector(`#email`);
    var messageInput = await page.waitForSelector(`#message`);
    var submitButton = await page.waitForSelector(`button[type='submit']`);
    await nameInput!.type("John Doe");
    await emailInput!.type("john@example.com");
    await messageInput!.type("Hello, I would like to know more about your services!");
    await submitButton!.click();

    async function waitForNavigation() {
      try {
        await page.waitForNavigation({
          waitUntil: "networkidle0",
        });
      } catch (error) {}
    }

    await waitForNavigation();

    var successMessage = await page.waitForSelector(`h1`);

    const successMessage_text = await successMessage!.evaluate((e) => e.textContent);
    expect(successMessage_text).toBe("Thank you for your message!");

    await browser.close();
  });
});
