import PuppeteerWebTest from "./engines/puppeteer";

async function generated() {
  const browser = new PuppeteerWebTest();

  await browser.navigateTo(`http://localhost:3000`);
await browser.setInputValue(`#name`, `John Doe`);
await browser.setInputValue(`#email`, `john@example.com`);
await browser.setInputValue(`#message`, `Hello, I am interested in your services.`);
await browser.clickElement(`button[type='submit']`);
await browser.expectElementText(`h1`, `Thank you for your message!`);
await browser.closeBrowser();

  await browser.closeBrowser();
}

generated();
