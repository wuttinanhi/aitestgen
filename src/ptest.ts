import puppeteer from "puppeteer";

async function ptest() {
  // Or import puppeteer from 'puppeteer-core';

  // Launch the browser and open a new blank page
  const browser = await puppeteer.launch({
    headless: false,
    // args: ["--start-maximized"],
  });
  const page = await browser.newPage();

  // Navigate the page to a URL.
  // await page.goto("https://developer.chrome.com/");
  await page.goto("https://todomvc.com");

  // Set screen size.
  await page.setViewport({ width: 1080, height: 1024 });

  // Type into search box.
  // await page.locator(".devsite-search-field").fill("automate beyond recorder");

  // Wait and click on first result.
  // await page.locator(".devsite-result-item-link").click();

  // Locate the full title with a unique string.
  // const textSelector = await page
  //   .locator("text/Customize and automate")
  //   .waitHandle();
  // const fullTitle = await textSelector?.evaluate((el) => el.textContent);

  // Print the full title.
  // console.log('The title of this blog post is "%s".', fullTitle);

  // Capture a screenshot of the page and save to ./screenshot.png
  await page.screenshot({ path: "screenshot.png" });

  await browser.close();
}

ptest();
