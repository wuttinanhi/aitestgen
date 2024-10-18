// A helper function to generate the iframe selector for Puppeteer

// rootVar: page, selectors: ["iframe"]
// Output: (await page.$("iframe").contentFrame())

// rootVar: page, selectors: ["iframe", "iframe"]
// Output: (await (await page.$("iframe").contentFrame()).$("iframe").contentFrame())

// rootVar: page, selectors: ["iframe", "iframe", "iframe"]
// Output: (await (await (await page.$("iframe").contentFrame()).$("iframe").contentFrame()).$("iframe").contentFrame())

export async function generateIframeSelector(
  rootVar: string,
  selectors: string[]
): Promise<string> {
  let result = "";

  for (let i = 0; i < selectors.length; i++) {
    if (i === 0) {
      result += `(${rootVar}.$("${selectors[i]}") as any).contentFrame()`;
    } else {
      result = `(await ${result}).$("${selectors[i]}").contentFrame()`;
    }
  }

  return `(await ${result})`;
}
