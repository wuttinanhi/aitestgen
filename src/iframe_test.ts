import { PuppeteerEngine } from "./engines/puppeteer";

async function iframeTest() {
  const puppeteer = new PuppeteerEngine();

  await puppeteer.launchBrowser();
  await puppeteer.navigateTo("http://localhost:8080");
  const iframes = await puppeteer.iframeGetData();

  console.log(iframes);

  await puppeteer.iframeSwitch(2);

  const iframe2Html = await puppeteer.getHtmlSource();
  console.log(iframe2Html);

  await puppeteer.iframeReset();

  //   const tabs = await puppeteer.getTabs();
  //   await puppeteer.setTab(tabs.at(-1).index);

  const rootHtml = await puppeteer.getHtmlSource();
  console.log(rootHtml);
}

iframeTest();
