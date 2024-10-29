import { zodFunction } from "openai/helpers/zod";
import z from "zod";

export const launchBrowserParams = z.object({});
export type TypeLaunchBrowserParams = z.infer<typeof launchBrowserParams>;
export const launchBrowserTool = zodFunction({
  name: "launchBrowser",
  parameters: launchBrowserParams,
  description: "Launch the browser",
});

export const navigateToParams = z.object({
  url: z.string().describe("The URL to navigate to"),
});
export type TypeNavigateToParams = z.infer<typeof navigateToParams>;
export const navigateToTool = zodFunction({
  name: "navigateTo",
  parameters: navigateToParams,
  description: "Navigate to the given URL",
});

export const getHtmlSourceParams = z.object({});
export type TypeGetHtmlSourceParams = z.infer<typeof getHtmlSourceParams>;
export const getHtmlSourceTool = zodFunction({
  name: "getHtmlSource",
  parameters: getHtmlSourceParams,
  description: "Get the HTML source of the current page",
});

export const clickElementParams = z.object({
  varSelector: z.string().describe("The variable name of the element"),
});
export type TypeClickElementParams = z.infer<typeof clickElementParams>;
export const clickElementTool = zodFunction({
  name: "clickElement",
  parameters: clickElementParams,
  description: "Click the element that matches the given selector",
});

export const setInputValueParams = z.object({
  varSelector: z.string().describe("The variable name of the element"),
  value: z.string().describe("The value to set"),
});
export type TypeSetInputValueParams = z.infer<typeof setInputValueParams>;
export const setInputValueTool = zodFunction({
  name: "setInputValue",
  parameters: setInputValueParams,
  description: "Set the value of the element that matches the given selector",
});

export const getInputValueParams = z.object({
  varSelector: z.string().describe("The variable name of the element"),
});
export type TypeGetInputValueParams = z.infer<typeof getInputValueParams>;
export const getInputValueTool = zodFunction({
  name: "getInputValue",
  parameters: getInputValueParams,
  description: "Get the value of the element that matches the given selector",
});

export const setOptionValueParams = z.object({
  varSelector: z.string().describe("The variable name of the element"),
  value: z.string().describe("The value to set"),
});
export type TypeSetOptionValueParams = z.infer<typeof setOptionValueParams>;
export const setOptionValueTool = zodFunction({
  name: "setOptionValue",
  parameters: setOptionValueParams,
  description: "Set the value of the option that matches the given selector",
});

export const getOptionValueParams = z.object({
  varSelector: z.string().describe("The variable name of the element"),
});
export type TypeGetOptionValueParams = z.infer<typeof getOptionValueParams>;
export const getOptionValueTool = zodFunction({
  name: "getOptionValue",
  parameters: getOptionValueParams,
  description: "Get the value of the option that matches the given selector",
});

export const expectElementVisibleParams = z.object({
  varSelector: z.string().describe("The variable name of the element"),
  visible: z.boolean().describe("Whether the element should be visible"),
});
export type TypeExpectElementVisibleParams = z.infer<
  typeof expectElementVisibleParams
>;
export const expectElementVisibleTool = zodFunction({
  name: "expectElementVisible",
  parameters: expectElementVisibleParams,
  description:
    "Expect the element that matches the given selector to be visible (please use `getHtmlSource` before call this because you need up to date selector)",
});

export const expectElementTextParams = z.object({
  varSelector: z.string().describe("The variable name of the element"),
  expectedText: z.string().describe("The text to check for"),
});
export type TypeExpectElementTextParams = z.infer<
  typeof expectElementTextParams
>;
export const expectElementTextTool = zodFunction({
  name: "expectElementText",
  parameters: expectElementTextParams,
  description:
    "Expect the element that matches the given selector to have the given text (please use `getHtmlSource` before call this because you need up to date selector)",
});

export const getCurrentUrlParams = z.object({});
export type TypeGetCurrentUrlParams = z.infer<typeof getCurrentUrlParams>;
export const getCurrentUrlTool = zodFunction({
  name: "getCurrentUrl",
  parameters: getCurrentUrlParams,
  description: "Get the current URL",
});

export const closeBrowserParams = z.object({});
export type TypeCloseBrowserParams = z.infer<typeof closeBrowserParams>;
export const closeBrowserTool = zodFunction({
  name: "closeBrowser",
  parameters: closeBrowserParams,
  description: "Close the browser",
});

export const completeParams = z.object({});
export type TypeCompleteParams = z.infer<typeof completeParams>;
export const completeTool = zodFunction({
  name: "complete",
  parameters: completeParams,
  description: "Call this when the test generation is completed.",
});

export const getTabsParams = z.object({});
export type TypeGetTabsParams = z.infer<typeof getTabsParams>;
export const getTabsTool = zodFunction({
  name: "getTabs",
  parameters: getTabsParams,
  description: "Get all the tabs data in the browser",
});

export const setTabParams = z.object({
  tabId: z.number().describe("The ID of the tab to switch to"),
});
export type TypeSetTabParams = z.infer<typeof setTabParams>;
export const setTabTool = zodFunction({
  name: "switchTab",
  parameters: setTabParams,
  description: "Switch to the tab with the given ID",
});

export const closeTabParams = z.object({
  tabId: z.number().describe("The ID of the tab to close"),
});
export type TypeCloseTabParams = z.infer<typeof closeTabParams>;
export const closeTabTool = zodFunction({
  name: "closeTab",
  parameters: closeTabParams,
  description: "Close the tab with the given ID",
});

export const resetParams = z.object({});
export type TypeResetParams = z.infer<typeof resetParams>;
export const resetTool = zodFunction({
  name: "reset",
  parameters: resetParams,
  description: "Relaunch the browser and reset the state.",
});

export const goBackHistoryParams = z.object({});
export type TypeGoBackHistoryParams = z.infer<typeof goBackHistoryParams>;
export const goBackHistoryTool = zodFunction({
  name: "goBackHistory",
  parameters: goBackHistoryParams,
  description: "Go back in the browser history",
});

export const goForwardHistoryParams = z.object({});
export type TypeGoForwardHistoryParams = z.infer<typeof goForwardHistoryParams>;
export const goForwardHistoryTool = zodFunction({
  name: "goForwardHistory",
  parameters: goForwardHistoryParams,
  description: "Go forward in the browser history",
});

export const iframeGetDataParams = z.object({});
export type TypeIframeGetDataParams = z.infer<typeof iframeGetDataParams>;
export const iframeGetDataTool = zodFunction({
  name: "iframeGetData",
  parameters: iframeGetDataParams,
  description: "Get all iframes in this page",
});

export const iframeSwitchParams = z.object({
  index: z.number().describe("The index of the iframe to switch to"),
});
export type TypeIframeSwitchParams = z.infer<typeof iframeSwitchParams>;
export const iframeSwitchTool = zodFunction({
  name: "iframeSwitch",
  parameters: iframeSwitchParams,
  description: "Switch to the iframe at the given index",
});

export const iframeResetParams = z.object({});
export type TypeIframeResetParams = z.infer<typeof iframeResetParams>;
export const iframeResetTool = zodFunction({
  name: "iframeReset",
  parameters: iframeResetParams,
  description: "Reset and focus on root page",
});

export const SelectorTypeZodEnum = z
  .enum(["css", "xpath", "id"])
  .describe("The type of the selector");

export const createSelectorVariableParams = z.object({
  varName: z.string().describe("The variable name of the element"),
  selectorType: SelectorTypeZodEnum,
  selectorValue: z.string().describe("The selector value"),
});
export type TypeCreateSelectorVariableParams = z.infer<
  typeof createSelectorVariableParams
>;
export const createSelectorVariableTool = zodFunction({
  name: "createSelectorVariable",
  parameters: createSelectorVariableParams,
  description: "Create a variable for a selector",
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
  setTabTool,
  closeTabTool,
  resetTool,
  goBackHistoryTool,
  goForwardHistoryTool,
  iframeGetDataTool,
  iframeSwitchTool,
  iframeResetTool,
  createSelectorVariableTool,
];
