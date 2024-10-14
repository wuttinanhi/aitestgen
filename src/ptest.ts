import puppeteer, { Page } from "puppeteer";
import { element2selector } from "puppeteer-element2selector";

async function getElementsMeta(page: Page, etype: string) {
  const elements = await page.$$(etype);

  let elementMetas: any[] = [];

  for (const elem of elements) {
    const elementMeta: any = await elem.evaluate((node) => {
      // @ts-ignore
      // function getFirstLevelText(element) {
      //   return (
      //     Array.from(element.childNodes)
      //       // @ts-ignore
      //       .filter((node) => node.nodeType === Node.TEXT_NODE) // Get only text nodes
      //       // @ts-ignore
      //       .map((textNode) => textNode.nodeValue.trim()) // Trim and map text content
      //       .join(" ")
      //   ); // Join them as single string
      // }

      return {
        className: node.className,
        id: node.id,
        // innerText:
        //   (node as any).innerText.split("\n") === 1
        //     ? (node as any).innerText
        //     : undefined,
        innerText: (node as any).innerText,
      };
    });

    elementMeta["css_selector"] = await element2selector(elem as any);
    elementMeta["type"] = etype;

    elementMetas.push(elementMeta);
  }

  return elementMetas;
}

async function getTextElements(page: Page) {
  // const elements = await page.$$("p");

  // let elementMetas: any[] = [];

  // for (const elem of elements) {
  //   const elementMeta: any = await elem.evaluate((e) => {
  //     // @ts-ignore
  //     // function getXPath(element) {
  //     //   if (element.id) {
  //     //     return `//*[@id="${element.id}"]`;
  //     //   }
  //     //   let path = "";
  //     //   let currentElem = element;
  //     //   while (currentElem) {
  //     //     let tag = currentElem.tagName.toLowerCase();
  //     //     let index =
  //     //       Array.from(currentElem.parentNode.children).indexOf(currentElem) +
  //     //       1;
  //     //     path = `/${tag}[${index}]` + path;
  //     //     currentElem =
  //     //       currentElem.parentNode.nodeType === 1
  //     //         ? currentElem.parentNode
  //     //         : null;
  //     //   }
  //     //   return path;
  //     // }

  //     return {
  //       className: e.className,
  //       id: e.id,
  //       innerText: e.innerText,
  //       // xpath: getXPath(e),
  //     };
  //   });

  //   elementMeta["css_selector"] = await element2selector(elem as any);

  //   elementMetas.push(elementMeta);
  // }

  // return elementMetas;

  const results = await page.evaluate(async () => {
    // List of tag names that commonly contain text
    const elements = Array.from(
      document.querySelectorAll("p, h1, h2, h3, h4, h5, span, li")
    );

    // @ts-ignore
    function getXPath(element) {
      if (element.id) {
        return `//*[@id="${element.id}"]`;
      }
      let path = "";
      let currentElem = element;
      while (currentElem) {
        let tag = currentElem.tagName.toLowerCase();
        let index =
          Array.from(currentElem.parentNode.children).indexOf(currentElem) + 1;
        path = `/${tag}[${index}]` + path;
        currentElem =
          currentElem.parentNode.nodeType === 1 ? currentElem.parentNode : null;
      }
      return path;
    }

    // xpath: `//${element.tagName.toLowerCase()}`, // Basic XPath
    // fullXpath: getXPath(element), // Full XPath from root

    const metas = [];

    for (const elem of elements) {
      const elementMeta: any = {
        tag: elem.tagName.toLowerCase(),
        innerText: (elem as any).innerText,
        // xpath: getXPath(elem),
      };

      // elementMeta["css_selector"] = await element2selector(elem as any);

      metas.push(elementMeta);
    }

    return metas;
  });

  return results;
}

async function ptest() {
  // const URL = "https://stripe-checkout-next-js-demo.vercel.app/";
  const URL =
    "https://checkout.stripe.com/c/pay/cs_test_a1vcIOEalpS6TmoNTkr4cDFfYdfO6j3TJFsa580yznVQ5xVSviDjxc3V4q#fidkdWxOYHwnPyd1blpxYHZxWjA0T2dNMk5DMW1hV3JEPWxHakN3anBdd3JpfW5mY2ppcktJM2l%2FTzdMRDRxQ2x1bnd3cFVBb3xvTndLRmRXdUNqMUdCRFNfNjBpREkxVklwRzBLd11rQl81NTVzSV1zY0RtRCcpJ2hsYXYnP34naHBsYSc%2FJz1mMWZkZjAxKDU9Nj0oMTJhPShkM2RjKDEzPTBkPDA2PGE2YWY0ZzxgZycpJ3ZsYSc%2FJzw0MDFhYWE1KDw8NzQoMT0xPCg8NDE2KDAwMzU0MjFhYDY1PWMzNDExPCcpJ2JwbGEnPycyYGdgMTw8YyhnZDxgKDExZzEoPDMxYSg0MzwzMGNmMDY8MmdmZmdmMDUneCknZ2BxZHYnP15YKSdpZHxqcHFRfHVgJz8ndmxrYmlgWmxxYGgnKSd3YGNgd3dgd0p3bGJsayc%2FJ21xcXV2PyoqdnF3bHVgKGZtYGZuanBxKGtgfXEob3YoYWBoaitzYHdmYGkrZHV1J3gl";

  // Launch the browser and open a new blank page
  const browser = await puppeteer.launch({
    headless: false,
    // args: ["--start-maximized"],
  });
  const page = await browser.newPage();

  // Navigate the page to a URL.
  await page.goto(URL);

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

  // Wait for the page to load completely.
  try {
    await Promise.all([
      page.waitForNavigation({
        timeout: 8_000,
      }),
      page.waitForNetworkIdle({
        timeout: 8_000,
      }),
    ]);
  } catch (error) {}

  // Capture a screenshot of the page and save to ./screenshot.png
  await page.screenshot({ path: "screenshot.png" });

  // sleep for 2 seconds
  // await sleep(2000);

  // const button_meta = await getElementsMeta(page, "button");
  // for (const meta of button_meta) {
  //   console.log(meta);
  // }

  // const input_meta = await getElementsMeta(page, "input");
  // for (const meta of input_meta) {
  //   console.log(meta);
  // }

  // const p_meta = await getElementsMeta(page, "p");
  // for (const meta of p_meta) {
  //   console.log(meta);
  // }

  const div_meta = await getElementsMeta(page, "div");
  for (const meta of div_meta) {
    if (meta.innerText === "") continue;
    console.log(meta);
  }

  // const txtElements = await getTextElements(page);
  // console.log(txtElements);

  await browser.close();
}

ptest();
