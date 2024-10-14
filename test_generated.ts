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

  //

  await page.goto("http://localhost:3000");

  var inputElement = await page.$("#name");
  if (!inputElement) {
    throw new Error(`Element not found: ${"#name"}`);
  }

  await inputElement.type("John Doe");

  var inputElement = await page.$("#email");
  if (!inputElement) {
    throw new Error(`Element not found: ${"#email"}`);
  }

  await inputElement.type("john@example.com");

  var inputElement = await page.$("#message");
  if (!inputElement) {
    throw new Error(`Element not found: ${"#message"}`);
  }

  await inputElement.type(
    "Hello, I would like to know more about your services!",
  );

  var submitButton = await page.$("button[type='submit']");
  if (!submitButton) {
    throw new Error(`Element not found: ${"button[type='submit']"}`);
  }
  await submitButton.click();

  await Promise.race([
    page.waitForNavigation({
      waitUntil: "networkidle0",
      timeout: 10000,
    }),
    page.waitForNetworkIdle({
      timeout: 10000,
    }),
  ]);

  var successMessageText = await page.$("h1");
  if (!successMessageText) {
    throw new Error(`Element not found: ${"h1"}`);
  }

  const successMessageText_text = await successMessageText.evaluate(
    (e) => e.textContent,
  );
  if (successMessageText_text !== "Thank you for your message!") {
    throw new Error(
      `Expect text element: (${"h1"}) to be Thank you for your message! but got ${successMessageText_text}`,
    );
  } else {
    console.log(
      `✅ Expect text element: (${"h1"}) to be Thank you for your message! is correct`,
    );
  }

  await browser.close();
}

runTest();
