import puppeteer, { Browser } from "puppeteer";
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

    const nameInput = await page.waitForSelector(`#name`);
    const emailInput = await page.waitForSelector(`#email`);
    const messageInput = await page.waitForSelector(`#message`);
    const submitButton = await page.waitForSelector(`button[type='submit']`);
    await nameInput!.type("John Doe");
    await emailInput!.type("john@example.com");
    await messageInput!.type(
      "Hello, I would like to know more about your services!"
    );
    await submitButton!.click();

    async function waitForNavigation() {
      try {
        await page.waitForNavigation({
          waitUntil: "networkidle0",
        });
      } catch (error) {}
    }

    await waitForNavigation();

    const successMessage = await page.waitForSelector(`h1`);
    const successText = await page.waitForSelector(`p`);

    const successMessage_text = await successMessage!.evaluate(
      (e) => e.textContent
    );
    expect(successMessage_text).toBe("Thank you for your message!");

    const successText_text = await successText!.evaluate((e) => e.textContent);
    expect(successText_text).toBe(
      "Your message has been received, and we will get back to you shortly."
    );

    await browser.close();
  });
});
