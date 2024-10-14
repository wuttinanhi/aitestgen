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

    var task1 = await page.$("#new-task");
    expect(task1).not.toBeNull();

    await task1!.type("Feed the dog");

    await page.keyboard.press("Enter");

    var task2 = await page.$("#new-task");
    expect(task2).not.toBeNull();

    await task2!.type("Learn to code");

    await page.keyboard.press("Enter");

    var task3 = await page.$("#new-task");
    expect(task3).not.toBeNull();

    await task3!.type("Cook dinner");

    await page.keyboard.press("Enter");

    var task1Verification = await page.$(
      "#tasks > li:nth-child(2) > label > span",
    );
    expect(task1Verification).not.toBeNull();
    console.log(
      `✅ Expect element visible: ${"#tasks > li:nth-child(2) > label > span"} is correct`,
    );

    var task2Verification = await page.$(
      "#tasks > li:nth-child(3) > label > span",
    );
    expect(task2Verification).not.toBeNull();
    console.log(
      `✅ Expect element visible: ${"#tasks > li:nth-child(3) > label > span"} is correct`,
    );

    var task3Verification = await page.$(
      "#tasks > li:nth-child(4) > label > span",
    );
    expect(task3Verification).not.toBeNull();
    console.log(
      `✅ Expect element visible: ${"#tasks > li:nth-child(4) > label > span"} is correct`,
    );

    await browser.close();
  });
});
