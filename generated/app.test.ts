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

    await page.goto("http://localhost:8080");

    var rootFrame = page.mainFrame();
    var baseFrame = rootFrame.childFrames();
    var page_iframe0 = baseFrame[0];

    var page_iframe0_childFrames = page_iframe0.childFrames();
    var page_iframe0_iframe0 = page_iframe0_childFrames[0];

    var page_iframe0_iframe0_childFrames = page_iframe0_iframe0.childFrames();
    var page_iframe0_iframe0_iframe0 = page_iframe0_iframe0_childFrames[0];

    var clickButton = await page_iframe0_iframe0_iframe0.$("button");
    expect(clickButton).not.toBeNull();
    await clickButton!.click();

    var showText = await page_iframe0_iframe0_iframe0.$("#showText");
    expect(showText).not.toBeNull();

    var showTextText = await page_iframe0_iframe0_iframe0.$("#showText");
    expect(showTextText).not.toBeNull();

    const showTextText_text = await showTextText!.evaluate(
      (e) => e.textContent
    );
    expect(showTextText_text).toBe("CLICKED!");
    await browser.close();
  });
});
