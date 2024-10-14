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

    //

    await page.goto("http://localhost:3000");

    var inputElement = await page.$("#name");
    if (!inputElement) {
      throw new Error(`Element not found: ${"#name"}`);
    }

    await inputElement.type("John Doe");

    var inputElement = await page.$("#email");
    if (!inputElement) {
      throw new Error(`Element not found: ${"#email"}`);
    }

    await inputElement.type("john@example.com");

    var inputElement = await page.$("#message");
    if (!inputElement) {
      throw new Error(`Element not found: ${"#message"}`);
    }

    await inputElement.type(
      "Hello, I would like to know more about your services!",
    );

    var submitButton = await page.$("button[type='submit']");
    expect(submitButton).not.toBeNull();
    await submitButton!.click();

    await Promise.race([
      page.waitForNavigation({
        waitUntil: "networkidle0",
        timeout: 10000,
      }),
      page.waitForNetworkIdle({
        timeout: 10000,
      }),
    ]);

    var successText = await page.$("h1");
    expect(successText).not.toBeNull();

    const successText_text = await successText!.evaluate((e) => e.textContent);
    expect(successText_text).toBe("Thank you for your message!");
    // console.log(`✅ Expect text element: (${"h1"}) to be Thank you for your message! is correct`);

    await browser.close();
  });
});
