import PuppeteerWebTest from "./engines/puppeteer";

async function generated() {
  const browser = new PuppeteerWebTest();

  await browser.closeBrowser()

  await browser.closeBrowser();
}

generated();
