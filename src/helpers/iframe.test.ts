import { generateIframeSelector } from "./iframe";

test("generateIframeSelector 1 depth", async () => {
  const rootVar = "page";
  const selectors = ["iframe"];

  const result = await generateIframeSelector(rootVar, selectors);
  console.log(result);

  expect(result).toBe(`(await (page.$("iframe") as any).contentFrame())`);
});

test("generateIframeSelector 2 depth", async () => {
  const rootVar = "page";
  const selectors = ["iframe", "iframe"];

  const result = await generateIframeSelector(rootVar, selectors);
  console.log(result);

  expect(result).toBe(
    `(await (await page.$("iframe").contentFrame()).$("iframe").contentFrame())`
  );
});

test("generateIframeSelector 3 depth", async () => {
  const rootVar = "page";
  const selectors = ["iframe", "iframe", "iframe"];

  const result = await generateIframeSelector(rootVar, selectors);
  console.log(result);

  expect(result).toBe(
    `(await (await (await page.$("iframe").contentFrame()).$("iframe").contentFrame()).$("iframe").contentFrame())`
  );
});

test("generateIframeSelector 4 depth", async () => {
  const rootVar = "page";
  const selectors = ["iframe", "iframe", "iframe", "iframe"];

  const result = await generateIframeSelector(rootVar, selectors);
  console.log(result);

  expect(result).toBe(
    `(await (await (await (await page.$("iframe").contentFrame()).$("iframe").contentFrame()).$("iframe").contentFrame()).$("iframe").contentFrame())`
  );
});
