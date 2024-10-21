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

    await page.goto("https://stripe-checkout-next-js-demo.vercel.app/");

    var quantityInput = await page.$("input[type='number']");
    expect(quantityInput).not.toBeNull();

    await quantityInput!.type("1");

    var buyButton = await page.$(
      "#__next > div > main > div.shadow-lg.border.rounded.p-2 > button"
    );
    expect(buyButton).not.toBeNull();
    await buyButton!.click();

    async function waitForNavigation() {
      try {
        await page.waitForNavigation({
          waitUntil: "networkidle0",
          timeout: 100_000,
        });
      } catch (error) {}
    }
    await waitForNavigation();

    var emailInput = await page.$("#email");
    expect(emailInput).not.toBeNull();

    await emailInput!.type("john@example.com");

    var cardNumberInput = await page.$("#cardNumber");
    expect(cardNumberInput).not.toBeNull();

    await cardNumberInput!.type("4242 4242 4242 4242");

    var cardExpiryInput = await page.$("#cardExpiry");
    expect(cardExpiryInput).not.toBeNull();

    await cardExpiryInput!.type("12/30");

    var cardCvcInput = await page.$("#cardCvc");
    expect(cardCvcInput).not.toBeNull();

    await cardCvcInput!.type("123");

    var cardHolderNameInput = await page.$("#billingName");
    expect(cardHolderNameInput).not.toBeNull();

    await cardHolderNameInput!.type("John Doe");

    var payButton = await page.$(".SubmitButton");
    expect(payButton).not.toBeNull();
    await payButton!.click();

    var successMessage = await page.$(".bg-green-100");
    expect(successMessage).not.toBeNull();

    await browser.close();
  });
});
