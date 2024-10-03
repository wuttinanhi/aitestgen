import PuppeteerWebTest from "./engines/puppeteer";

async function generated() {
  const browser = new PuppeteerWebTest();

  await browser.launchBrowser();
  await browser.navigateTo("https://todomvc.com/");
  await browser.clickElement("a[href*=react]");
  await browser.typeText("#todo-input", "Prepare for interview");
  await browser.pressKey("Enter");
  const b = await browser.expectElementText(
    "ul.todo-list li:last-child",
    "Prepare for interview"
  );
  console.log(b);

  await browser.closeBrowser();
  await browser.closeBrowser();

  await browser.closeBrowser();
}

generated();
