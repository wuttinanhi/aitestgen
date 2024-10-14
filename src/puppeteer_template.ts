import puppeteer from "puppeteer";

async function runTest() {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: {
      width: 1280,
      height: 720,
    },
    // start in maximized window
    // defaultViewport: null,
    // args: ["--start-maximized"],
  });

  let page = await browser.newPage();

  // {{GENERATED_CODE}}
}

runTest();
