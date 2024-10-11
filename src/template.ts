import puppeteer from "puppeteer";

async function generated() {
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

  // <REPLACE TEST STEPS>
}

generated();
