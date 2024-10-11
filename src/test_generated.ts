import PuppeteerWebTest from "./engines/puppeteer";

async function generated() {
  const browser = new PuppeteerWebTest();

  await browser.launchBrowser();
  await browser.setInputValue(`input[name='name']`, `John Doe`);
  await browser.setInputValue(`input[name='email']`, `john@example.com`);
  await browser.setInputValue(
    `textarea[name='message']`,
    `Hello, I am interested in your services.`
  );
  await browser.clickElement(`button[type='submit']`);
  const expect_1 = await browser.expectElementText(
    `h1`,
    `Thank you for your message!`
  );
  console.log(expect_1);

  await browser.closeBrowser();

  await browser.closeBrowser();
}

generated();
