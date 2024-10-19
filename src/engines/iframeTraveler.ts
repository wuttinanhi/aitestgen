import { Frame, Page } from "puppeteer";
import { element2selector } from "puppeteer-element2selector";

export async function iframeTraveler(
  page: Page | Frame,
  dataArrBuffer: any[],
  parentSelector: any[],
  depth: number
) {
  if (depth >= 5) {
    return;
  }

  const iframes = await page.$$("iframe");

  for (const iframe of iframes) {
    const this_iframe_css_selector = await element2selector(iframe as any);

    const contentFrame = await iframe.contentFrame();

    // prettier-ignore
    const iframe_src_url = await iframe.evaluate((el) => (el as HTMLIFrameElement).src);
    const i: number = dataArrBuffer.length;
    const iframeAsPage: Page = contentFrame as any;
    const text = await iframeAsPage.evaluate(() => document.body.innerText);
    // const htmlSource = await contentFrame.content();
    const composed_css_selector = parentSelector.concat(
      this_iframe_css_selector
    );

    dataArrBuffer.push({
      index: i,
      iframe_src_url,
      depth,
      _internalPage: iframeAsPage,
      text,
      composed_css_selector,
      // htmlSource,
    });

    // console.log("iurl", contentFrame.url());
    // const page = contentFrame.page();
    // if (!page) {
    //   console.warn("Iframe page not found");
    //   continue;
    // }
    await iframeTraveler(
      iframeAsPage,
      dataArrBuffer,
      composed_css_selector,
      depth + 1
    );
  }

  return dataArrBuffer;
}
