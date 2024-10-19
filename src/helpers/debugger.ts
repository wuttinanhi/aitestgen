import { Frame, Page } from "puppeteer";

export async function DEBUG_GET_TITLE(v: Page | Frame) {
  const title = await v.title();
  console.log(title);
  return;
}

export async function DEBUG_IFRAME_SRC(v: Page | Frame) {
  const src = await v.evaluate(() => document.location.href);
  console.log(src);
  return;
}
