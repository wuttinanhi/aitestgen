// import { ElementHandle } from "puppeteer";
// import { element2selector } from "puppeteer-element2selector";
// import { QuickSelectorElement } from "src/interfaces/controller.ts";

// async function quickSelectorRecursive(elements: ElementHandle<Element>[]) {
//   const result: QuickSelectorElement[] = [];

//   for (const element of elements) {
//     let cssSelector = await element2selector(element as any);

//     let tag = await element.evaluate((e) => e.tagName);
//     tag = String(tag).toLowerCase();

//     const textContent = await element.evaluate((el) => {
//       return el.textContent ? el.textContent.trim() : "";
//     });

//     let childElements = await element.$$(":scope > *");

//     if (childElements.length > 0) {
//       const childs = await quickSelectorRecursive(childElements);
//     } else {
//       result.push({
//         tag: tag,
//         textElement: textContent,
//         cssSelector: cssSelector,
//         childs: [],
//       });
//     }
//   }

//   return result;
// }
