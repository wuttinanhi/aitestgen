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

    var submitButton1 = await page.$("input[type='submit']");
    expect(submitButton1).not.toBeNull();
    await submitButton1!.click();

    var submitButton2 = await page.$("input[type='submit']");
    expect(submitButton2).not.toBeNull();
    await submitButton2!.click();

    var submitButton3 = await page.$("input[type='submit']");
    expect(submitButton3).not.toBeNull();
    await submitButton3!.click();

    await browser.close();
  });
});
