import { readFileString } from "./helpers/files";
import { HTMLStripNonDisplayTags } from "./helpers/html";

async function main() {
  const htmlStr = await readFileString("raws/stripe_checkout_page.html");
  console.log("before trim", htmlStr.length);

  const htmlStrTrimmed = HTMLStripNonDisplayTags(htmlStr);

  console.log("after trim", htmlStrTrimmed.length);
}

main();
