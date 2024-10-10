import PuppeteerWebTest from "./engines/puppeteer";

async function generated() {
  const browser = new PuppeteerWebTest();

  await browser.launchBrowser();
await browser.navigateTo(`https://stripe-checkout-next-js-demo.vercel.app/`);
await browser.setInputValue(`input[type='number']`, `1`);
await browser.clickElement(`#__next > div > main > div.shadow-lg.border.rounded.p-2 > button`);
await browser.setInputValue(`input#email`, `john@example.com`);
await browser.setInputValue(`input#cardNumber`, `4242 4242 4242 4242`);
await browser.setInputValue(`input#cardExpiry`, `12/30`);
await browser.setInputValue(`input#cardCvc`, `123`);
await browser.setInputValue(`input#billingName`, `John Doe`);
await browser.clickElement(`button[type='submit']`);
const expect_1 = await browser.expectElementVisible(`.bg-green-100`, true);
console.log(expect_1);

await browser.closeBrowser();

  await browser.closeBrowser();
}

generated();
