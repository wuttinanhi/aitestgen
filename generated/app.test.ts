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

    var pageCheckpoint = page;
    // prettier-ignore
    page = (await (await (await (page.$("iframe") as any).contentFrame()).$("iframe").contentFrame()).$("iframe").contentFrame());

    var clickButton = await page.$("button");
    expect(clickButton).not.toBeNull();
    await clickButton!.click();

    var showText = await page.$("#showText");
    expect(showText).not.toBeNull();
    console.log(`✅ Expect element visible: ${"#showText"} is correct`);

    var showTextText = await page.$("#showText");
    expect(showTextText).not.toBeNull();

    const showTextText_text = await showTextText!.evaluate(
      (e) => e.textContent
    );
    expect(showTextText_text).toBe("CLICKED!");
    console.log(`✅ Expect text element: (${"#showText"}) to be "CLICKED!"`);

    await browser.close();
  });
});
