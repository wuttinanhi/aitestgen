import puppeteer from "puppeteer";

async function mainTest() {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: {
      width: 1280,
      height: 720,
    },
  });

  let page = await browser.newPage();
  await page.goto("https://stripe-checkout-next-js-demo.vercel.app/");

  var quantityInput = await page.$("input[type='number']");
  await quantityInput!.type("1");

  var buyButton = await page.$("#__next > div > main > div.shadow-lg.border.rounded.p-2 > button");
  await buyButton!.click();

  console.log("before navigation");
  async function waitForNavigation() {
    try {
      await page.waitForNavigation({
        waitUntil: "networkidle0",
      });
    } catch (error) {}
  }
  await waitForNavigation();
  console.log("after navigation");

  console.log("before get");
  var emailInput = await page.$("#email");
  console.log(emailInput);
  console.log("after get ");
  if (emailInput === null) {
    console.log("null");
    return;
  }

  await emailInput!.type("john@example.com");

  var cardNumberInput = await page.$("#cardNumber");

  await cardNumberInput!.type("4242 4242 4242 4242");

  var cardExpiryInput = await page.$("#cardExpiry");

  await cardExpiryInput!.type("12/30");

  var cardCvcInput = await page.$("#cardCvc");

  await cardCvcInput!.type("123");

  var cardHolderNameInput = await page.$("#billingName");

  await cardHolderNameInput!.type("John Doe");

  var payButton = await page.$(".SubmitButton");
  await payButton!.click();

  var successMessage = await page.$(".bg-green-100");

  await browser.close();
}

mainTest();
