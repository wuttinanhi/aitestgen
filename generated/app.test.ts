import puppeteer, { Browser } from "puppeteer";

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

    var firstTaskInput = await page.$("#new-task");
    expect(firstTaskInput).not.toBeNull();

    await firstTaskInput!.type("Feed the dog");

    var submitButton = await page.$("input[type='submit']");
    expect(submitButton).not.toBeNull();
    await submitButton!.click();

    var secondTaskInput = await page.$("#new-task");
    expect(secondTaskInput).not.toBeNull();

    await secondTaskInput!.type("Learn to code");

    var submitButton = await page.$("input[type='submit']");
    expect(submitButton).not.toBeNull();
    await submitButton!.click();

    var thirdTaskInput = await page.$("#new-task");
    expect(thirdTaskInput).not.toBeNull();

    await thirdTaskInput!.type("Cook dinner");

    var submitButton = await page.$("input[type='submit']");
    expect(submitButton).not.toBeNull();
    await submitButton!.click();

    await browser.close();
  });
});
