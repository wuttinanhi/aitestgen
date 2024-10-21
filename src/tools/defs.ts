import { zodFunction } from "openai/src/helpers/zod.js";
import z from "zod";

export const launchBrowserParams = z.object({});
export const launchBrowserTool = zodFunction({
  name: "launchBrowser",
  parameters: launchBrowserParams,
  description: "Launch the browser",
});

export const navigateToParams = z.object({
  url: z.string().describe("The URL to navigate to"),
});
export const navigateToTool = zodFunction({
  name: "navigateTo",
  parameters: navigateToParams,
  description: "Navigate to the given URL",
});

export const getHtmlSourceParams = z.object({});
export const getHtmlSourceTool = zodFunction({
  name: "getHtmlSource",
  parameters: getHtmlSourceParams,
  description: "Get the HTML source of the current page",
});

export const clickElementParams = z.object({
  selector: z.string().describe("The selector of the element to click"),
  varName: z
    .string()
    .describe(
      "The variable name to store the element in (should be the element name like writing javascript puppeteer test and every variable name should be unique in entire test)"
    ),
});
export const clickElementTool = zodFunction({
  name: "clickElement",
  parameters: clickElementParams,
  description: "Click the element that matches the given selector",
});

export const setInputValueParams = z.object({
  selector: z
    .string()
    .describe("The selector of the element to set the value of"),
  value: z.string().describe("The value to set"),
  varName: z
    .string()
    .describe(
      "The variable name to store the element in (should be the element name like writing javascript puppeteer test and every variable name should be unique in entire test)"
    ),
});
export const setInputValueTool = zodFunction({
  name: "setInputValue",
  parameters: setInputValueParams,
  description: "Set the value of the element that matches the given selector",
});

export const getInputValueParams = z.object({
  selector: z
    .string()
    .describe("The selector of the element to get the value of"),
});
export const getInputValueTool = zodFunction({
  name: "getInputValue",
  parameters: getInputValueParams,
  description: "Get the value of the element that matches the given selector",
});

export const setOptionValueParams = z.object({
  selector: z
    .string()
    .describe("The selector of the option to set the value of"),
  value: z.string().describe("The value to set"),
});
export const setOptionValueTool = zodFunction({
  name: "setOptionValue",
  parameters: setOptionValueParams,
  description: "Set the value of the option that matches the given selector",
});

export const getOptionValueParams = z.object({
  selector: z
    .string()
    .describe("The selector of the option to get the value of"),
});
export const getOptionValueTool = zodFunction({
  name: "getOptionValue",
  parameters: getOptionValueParams,
  description: "Get the value of the option that matches the given selector",
});

export const expectElementVisibleParams = z.object({
  selector: z
    .string()
    .describe("The selector of the element to check for visibility"),
  visible: z.boolean().describe("Whether the element should be visible"),
  varName: z
    .string()
    .describe(
      "The variable name to store the element in (should be the element name like writing javascript puppeteer test and every variable name should be unique in entire test)"
    ),
});
export const expectElementVisibleTool = zodFunction({
  name: "expectElementVisible",
  parameters: expectElementVisibleParams,
  description:
    "Expect the element that matches the given selector to be visible (please use `getHtmlSource` before call this because you need up to date selector)",
});

export const expectElementTextParams = z.object({
  selector: z
    .string()
    .describe("The selector of the element to check the text of"),
  text: z.string().describe("The text to check for"),
  varName: z
    .string()
    .describe(
      "The variable name to store the element in (should be the element name like writing javascript puppeteer test and every variable name should be unique in entire test)"
    ),
});
export const expectElementTextTool = zodFunction({
  name: "expectElementText",
  parameters: expectElementTextParams,
  description:
    "Expect the element that matches the given selector to have the given text (please use `getHtmlSource` before call this because you need up to date selector)",
});

export const getCurrentUrlParams = z.object({});
export const getCurrentUrlTool = zodFunction({
  name: "getCurrentUrl",
  parameters: getCurrentUrlParams,
  description: "Get the current URL",
});

export const closeBrowserParams = z.object({});
export const closeBrowserTool = zodFunction({
  name: "closeBrowser",
  parameters: closeBrowserParams,
  description: "Close the browser",
});

export const completeParams = z.object({});
export const completeTool = zodFunction({
  name: "complete",
  parameters: completeParams,
  description: "Call this when the test generation is completed.",
});

export const getTabsParams = z.object({});
export const getTabsTool = zodFunction({
  name: "getTabs",
  parameters: getTabsParams,
  description: "Get all the tabs data in the browser",
});

export const switchTabParams = z.object({
  tabId: z.number().describe("The ID of the tab to switch to"),
});
export const switchTabTool = zodFunction({
  name: "switchTab",
  parameters: switchTabParams,
  description: "Switch to the tab with the given ID",
});

export const closeTabParams = z.object({
  tabId: z.number().describe("The ID of the tab to close"),
});
export const closeTabTool = zodFunction({
  name: "closeTab",
  parameters: closeTabParams,
  description: "Close the tab with the given ID",
});

export const resetParams = z.object({});
export const resetTool = zodFunction({
  name: "reset",
  parameters: resetParams,
  description: "Relaunch the browser and reset the state.",
});

export const goBackHistoryParams = z.object({});
export const goBackHistoryTool = zodFunction({
  name: "goBackHistory",
  parameters: goBackHistoryParams,
  description: "Go back in the browser history",
});

export const goForwardHistoryParams = z.object({});
export const goForwardHistoryTool = zodFunction({
  name: "goForwardHistory",
  parameters: goForwardHistoryParams,
  description: "Go forward in the browser history",
});

export const iframeGetDataParams = z.object({});
export const iframeGetDataTool = zodFunction({
  name: "iframeGetData",
  parameters: iframeGetDataParams,
  description: "Get all iframes in this page",
});

export const iframeSwitchParams = z.object({
  index: z.number().describe("The index of the iframe to switch to"),
});
export const iframeSwitchTool = zodFunction({
  name: "iframeSwitch",
  parameters: iframeSwitchParams,
  description: "Switch to the iframe at the given index",
});

export const iframeResetParams = z.object({});
export const iframeResetTool = zodFunction({
  name: "iframeReset",
  parameters: iframeResetParams,
  description: "Reset and focus on root page",
});

export const WebREPLToolsCollection = [
  launchBrowserTool,
  navigateToTool,
  getHtmlSourceTool,
  clickElementTool,
  setInputValueTool,
  getInputValueTool,
  setOptionValueTool,
  getOptionValueTool,
  expectElementVisibleTool,
  expectElementTextTool,
  getCurrentUrlTool,
  closeBrowserTool,
  completeTool,
  getTabsTool,
  switchTabTool,
  closeTabTool,
  resetTool,
  goBackHistoryTool,
  goForwardHistoryTool,
  iframeGetDataTool,
  iframeSwitchTool,
  iframeResetTool,
];
