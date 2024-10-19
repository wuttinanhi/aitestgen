import puppeteer, { Browser, Frame, Page } from "puppeteer";

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

    var baseFrame = page.mainFrame();
    var iframe_0 = baseFrame.childFrames()[0];

    var baseFrame = page.mainFrame();
    var iframe_0 = baseFrame.childFrames()[0];
    var iframe_1 = iframe_0.childFrames()[0];

    var baseFrame = page.mainFrame();
    var iframe_0 = baseFrame.childFrames()[0];
    var iframe_1 = iframe_0.childFrames()[0];
    var iframe_2 = iframe_1.childFrames()[0];

    var clickButton = await iframe_2.$("button");
    expect(clickButton).not.toBeNull();
    await clickButton!.click();

    var showText = await iframe_2.$("#showText");
    expect(showText).not.toBeNull();

    var showTextText = await iframe_2.$("#showText");
    expect(showTextText).not.toBeNull();

    const showTextText_text = await showTextText!.evaluate(
      (e) => e.textContent,
    );
    expect(showTextText_text).toBe("CLICKED!");
    await browser.close();
  });
});
