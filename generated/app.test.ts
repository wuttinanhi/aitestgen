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

    await page.goto("http://localhost:3000");

    var nameInput = await page.$("#name");
    expect(nameInput).not.toBeNull();

    await nameInput!.type("John Doe");

    var emailInput = await page.$("#email");
    expect(emailInput).not.toBeNull();

    await emailInput!.type("john@example.com");

    var messageInput = await page.$("#message");
    expect(messageInput).not.toBeNull();

    await messageInput!.type(
      "Hello, I would like to know more about your services!",
    );

    var submitButton = await page.$("button[type='submit']");
    expect(submitButton).not.toBeNull();
    await submitButton!.click();

    // wait for page load
    await Promise.race([
      page.waitForNavigation({
        waitUntil: "networkidle0",
        timeout: 10000,
      }),
      page.waitForNetworkIdle({
        timeout: 10000,
      }),
    ]);

    var successMessage = await page.$("h1");
    expect(successMessage).not.toBeNull();

    const successMessage_text = await successMessage!.evaluate(
      (e) => e.textContent,
    );
    expect(successMessage_text).toBe("Thank you for your message!");
    console.log(
      `✅ Expect text element: (${"h1"}) to be "Thank you for your message!"`,
    );

    await browser.close();
  });
});
