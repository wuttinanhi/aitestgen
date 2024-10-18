import { PuppeteerEngine } from "./engines/puppeteer";

async function iframeTest() {
  const puppeteer = new PuppeteerEngine();

  await puppeteer.launchBrowser();
  await puppeteer.navigateTo("http://localhost:8080");
  var iframes = await puppeteer.iframeGetData();

  //   console.log(iframes);
  //   console.log("\n\n\n\n\n");

  for (const iframe of iframes) {
    await puppeteer.iframeSwitch(iframe.index);
    const source = await puppeteer.getHtmlSource();

    console.log(iframe.index);
    console.log(source.textOnly);
    console.log("\n");
  }

  await puppeteer.iframeReset();

  //   const tabs = await puppeteer.getTabs();
  //   await puppeteer.setTab(tabs.at(-1).index);

  //   const rootHtml = await puppeteer.getHtmlSource();
  //   console.log(rootHtml);

  await puppeteer.closeBrowser();
}

iframeTest();
