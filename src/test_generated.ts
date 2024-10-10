import PuppeteerWebTest from "./engines/puppeteer";

async function generated() {
  const browser = new PuppeteerWebTest();

  await browser.launchBrowser();
await browser.navigateTo(`http://localhost:3000`);
await browser.setInputValue(`#name`, `John Doe`);
await browser.setInputValue(`#email`, `john@example.com`);
await browser.setInputValue(`#message`, `Hello, I am interested in your services.`);
await browser.clickElement(`button[type='submit']`);
const expect_1 = await browser.expectElementVisible(`h1`, true);
console.log(expect_1);

const expect_2 = await browser.expectElementText(`h1`, `Thank you for your message!`);
console.log(expect_2);


  await browser.closeBrowser();
}

generated();
