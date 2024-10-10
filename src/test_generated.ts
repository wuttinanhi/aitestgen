import PuppeteerWebTest from "./engines/puppeteer";

async function generated() {
  const browser = new PuppeteerWebTest();

  await browser.launchBrowser();
await browser.navigateTo(`https://www.youtube.com`);
await browser.setInputValue(`input#search`, `rickroll`);
await browser.clickElement(`#search-icon-legacy`);
await browser.clickElement(`ytd-thumbnail.ytd-video-renderer`);
const expect_1 = await browser.expectElementText(`h1.title.ytd-video-primary-info-renderer`, `Rick Astley - Never Gonna Give You Up (Official Music Video)`);
console.log(expect_1);

await browser.closeBrowser();

  await browser.closeBrowser();
}

generated();
