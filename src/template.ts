import PuppeteerWebTest from "./engines/puppeteer";

async function generated() {
  const browser = new PuppeteerWebTest();

  // <REPLACE TEST STEPS>

  await browser.closeBrowser();
}

generated();
