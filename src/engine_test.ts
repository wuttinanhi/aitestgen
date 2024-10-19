import { PuppeteerEngine } from "./engines/puppeteer";

async function engineTest() {
  const engine = new PuppeteerEngine();
  await engine.launchBrowser();
  await engine.navigateTo("http://localhost:8080");
  await engine.iframeGetData();
  await engine.iframeSwitch(0);
  const htmlSource = await engine.getHtmlSource();
  console.log(htmlSource);

  await engine.closeBrowser();
}

engineTest();
