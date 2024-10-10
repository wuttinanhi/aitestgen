import PuppeteerWebTest from "./engines/puppeteer";

async function generated() {
  const browser = new PuppeteerWebTest();

  await browser.launchBrowser();
await browser.navigateTo(`https://sveltekit-demo-psi.vercel.app/`);
await browser.clickElement(`button[aria-label='Delete Todo']`);
const expect_1 = await browser.expectElementText(`div.flex-1.px-2.py-3.text-base-content`, `0 of 0 remaining`);
console.log(expect_1);


  await browser.closeBrowser();
}

generated();
