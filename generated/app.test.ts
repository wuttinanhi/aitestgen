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

    var pageCheckpoint = page;

    async function DEBUG_PAGE_TEXT(page: Page | Frame) {
      const iframe_1_page_text = await page.evaluate(
        () => document.body.innerText
      );
      console.log(iframe_1_page_text);
    }

    async function DEBUG_PAGE_TYPE(page: Page | Frame) {
      console.log(await page.evaluate(() => document.title));
    }

    // prettier-ignore
    var root = page;

    var iframe_1_selector = (await root.$("iframe"))!;
    var iframe_1_page = await iframe_1_selector.contentFrame();
    await DEBUG_PAGE_TEXT(iframe_1_page);
    await DEBUG_PAGE_TYPE(iframe_1_page.page());

    var iframe_2_selector = (await iframe_1_page.$("iframe"))!;
    var iframe_2_page = await iframe_2_selector.contentFrame();
    await DEBUG_PAGE_TEXT(iframe_2_page);
    await DEBUG_PAGE_TYPE(iframe_1_page.page());

    // var clickButton = await page.$("button");
    // expect(clickButton).not.toBeNull();
    // await clickButton!.click();

    // var showText = await page.$("#showText");
    // expect(showText).not.toBeNull();
    // console.log(`✅ Expect element visible: ${"#showText"} is correct`);

    // var showTextText = await page.$("#showText");
    // expect(showTextText).not.toBeNull();

    // const showTextText_text = await showTextText!.evaluate(
    //   (e) => e.textContent
    // );
    // expect(showTextText_text).toBe("CLICKED!");
    // console.log(`✅ Expect text element: (${"#showText"}) to be "CLICKED!"`);

    await browser.close();
  });
});
