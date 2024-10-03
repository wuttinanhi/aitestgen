import PuppeteerWebTest from "./engines/puppeteer";

async function generated() {
  const browser = new PuppeteerWebTest();

  await browser.launchBrowser()
await browser.navigateTo('https://todomvc.com/')
await browser.clickElement('a[href*="react/dist/"]')
await browser.expectElementVisible('input.new-todo', true)
await browser.typeText('input.new-todo', 'Prepare for interview')
await browser.pressKey('Enter')
await browser.expectElementText('label[data-testid="todo-item-label"]', 'Prepare for interview')
await browser.closeBrowser()

  await browser.closeBrowser();
}

generated();
