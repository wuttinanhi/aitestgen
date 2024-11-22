import { StructuredToolParams } from "@langchain/core/tools";
import z from "zod";

export const launchBrowserParams = z.object({});
export type TypeLaunchBrowserParams = z.infer<typeof launchBrowserParams>;
export const launchBrowserTool: StructuredToolParams = {
  name: "launchBrowser",
  description: "Launch the browser",
  schema: launchBrowserParams,
};

export const navigateToParams = z.object({
  url: z.string().describe("The URL to navigate to"),
});
export type TypeNavigateToParams = z.infer<typeof navigateToParams>;
export const navigateToTool: StructuredToolParams = {
  name: "navigateTo",
  description: "Navigate to the given URL",
  schema: navigateToParams,
};

export const getHtmlSourceParams = z.object({});
export type TypeGetHtmlSourceParams = z.infer<typeof getHtmlSourceParams>;
export const getHtmlSourceTool: StructuredToolParams = {
  name: "getHtmlSource",
  description: "Get the HTML source of the current page",
  schema: getHtmlSourceParams,
};

export const clickElementParams = z.object({
  varSelector: z.string().describe("The variable name of the element"),
});
export type TypeClickElementParams = z.infer<typeof clickElementParams>;
export const clickElementTool: StructuredToolParams = {
  name: "clickElement",
  description: "Click the element that matches the given selector",
  schema: clickElementParams,
};

export const setInputValueParams = z.object({
  varSelector: z.string().describe("The variable name of the element"),
  value: z.string().describe("The value to set"),
});
export type TypeSetInputValueParams = z.infer<typeof setInputValueParams>;
export const setInputValueTool: StructuredToolParams = {
  name: "setInputValue",
  description: "Set the value of the element that matches the given selector",
  schema: setInputValueParams,
};

export const getInputValueParams = z.object({
  varSelector: z.string().describe("The variable name of the element"),
});
export type TypeGetInputValueParams = z.infer<typeof getInputValueParams>;
export const getInputValueTool: StructuredToolParams = {
  name: "getInputValue",
  description: "Get the value of the element that matches the given selector",
  schema: getInputValueParams,
};

export const setOptionValueParams = z.object({
  varSelector: z.string().describe("The variable name of the element"),
  value: z.string().describe("The value to set"),
});
export type TypeSetOptionValueParams = z.infer<typeof setOptionValueParams>;
export const setOptionValueTool: StructuredToolParams = {
  name: "setOptionValue",
  description: "Set the value of the option that matches the given selector",
  schema: setOptionValueParams,
};

export const getOptionValueParams = z.object({
  varSelector: z.string().describe("The variable name of the element"),
});
export type TypeGetOptionValueParams = z.infer<typeof getOptionValueParams>;
export const getOptionValueTool: StructuredToolParams = {
  name: "getOptionValue",
  description: "Get the value of the option that matches the given selector",
  schema: getOptionValueParams,
};

export const expectElementVisibleParams = z.object({
  varSelector: z.string().describe("The variable name of the element"),
  visible: z.boolean().describe("Whether the element should be visible"),
});
export type TypeExpectElementVisibleParams = z.infer<typeof expectElementVisibleParams>;
export const expectElementVisibleTool: StructuredToolParams = {
  name: "expectElementVisible",
  description:
    "Expect the element that matches the given selector to be visible (please use `getHtmlSource` before call this because you need up to date selector)",
  schema: expectElementVisibleParams,
};

export const expectElementTextParams = z.object({
  varSelector: z.string().describe("The variable name of the element"),
  expectedText: z.string().describe("The text to check for"),
});
export type TypeExpectElementTextParams = z.infer<typeof expectElementTextParams>;
export const expectElementTextTool: StructuredToolParams = {
  name: "expectElementText",
  description:
    "Expect the element that matches the given selector to have the given text (please use `getHtmlSource` before call this because you need up to date selector)",
  schema: expectElementTextParams,
};

export const getCurrentUrlParams = z.object({});
export type TypeGetCurrentUrlParams = z.infer<typeof getCurrentUrlParams>;
export const getCurrentUrlTool: StructuredToolParams = {
  name: "getCurrentUrl",
  description: "Get the current URL",
  schema: getCurrentUrlParams,
};

export const closeBrowserParams = z.object({});
export type TypeCloseBrowserParams = z.infer<typeof closeBrowserParams>;
export const closeBrowserTool: StructuredToolParams = {
  name: "closeBrowser",
  description: "Close the browser",
  schema: closeBrowserParams,
};

export const completeParams = z.object({});
export type TypeCompleteParams = z.infer<typeof completeParams>;
export const completeTool: StructuredToolParams = {
  name: "complete",
  description: "Call this when the test generation is completed.",
  schema: completeParams,
};

export const getTabsParams = z.object({});
export type TypeGetTabsParams = z.infer<typeof getTabsParams>;
export const getTabsTool: StructuredToolParams = {
  name: "getTabs",
  description: "Get all the tabs data in the browser",
  schema: getTabsParams,
};

export const setTabParams = z.object({
  tabId: z.number().describe("The ID of the tab to switch to"),
});
export type TypeSetTabParams = z.infer<typeof setTabParams>;
export const setTabTool: StructuredToolParams = {
  name: "switchTab",
  description: "Switch to the tab with the given ID",
  schema: setTabParams,
};

export const closeTabParams = z.object({
  tabId: z.number().describe("The ID of the tab to close"),
});
export type TypeCloseTabParams = z.infer<typeof closeTabParams>;
export const closeTabTool: StructuredToolParams = {
  name: "closeTab",
  description: "Close the tab with the given ID",
  schema: closeTabParams,
};

export const resetParams = z.object({});
export type TypeResetParams = z.infer<typeof resetParams>;
export const resetTool: StructuredToolParams = {
  name: "reset",
  description: "Relaunch the browser and reset the state.",
  schema: resetParams,
};

export const goBackHistoryParams = z.object({});
export type TypeGoBackHistoryParams = z.infer<typeof goBackHistoryParams>;
export const goBackHistoryTool: StructuredToolParams = {
  name: "goBackHistory",
  description: "Go back in the browser history",
  schema: goBackHistoryParams,
};

export const goForwardHistoryParams = z.object({});
export type TypeGoForwardHistoryParams = z.infer<typeof goForwardHistoryParams>;
export const goForwardHistoryTool: StructuredToolParams = {
  name: "goForwardHistory",
  description: "Go forward in the browser history",
  schema: goForwardHistoryParams,
};

export const iframeGetDataParams = z.object({});
export type TypeIframeGetDataParams = z.infer<typeof iframeGetDataParams>;
export const iframeGetDataTool: StructuredToolParams = {
  name: "iframeGetData",
  description: "Get all iframes in this page",
  schema: iframeGetDataParams,
};

export const iframeSwitchParams = z.object({
  index: z.number().describe("The index of the iframe to switch to"),
});
export type TypeIframeSwitchParams = z.infer<typeof iframeSwitchParams>;
export const iframeSwitchTool: StructuredToolParams = {
  name: "iframeSwitch",
  description: "Switch to the iframe at the given index",
  schema: iframeSwitchParams,
};

export const iframeResetParams = z.object({});
export type TypeIframeResetParams = z.infer<typeof iframeResetParams>;
export const iframeResetTool: StructuredToolParams = {
  name: "iframeReset",
  description: "Reset and focus on root page",
  schema: iframeResetParams,
};

export const SelectorTypeZodEnum = z.enum(["css", "xpath", "id"]).describe("The type of the selector");

export const createSelectorVariableParams = z.object({
  varName: z.string().describe("The variable name of the element"),
  selectorType: SelectorTypeZodEnum,
  selectorValue: z.string().describe("The selector value"),
});
export type TypeCreateSelectorVariableParams = z.infer<typeof createSelectorVariableParams>;
export const createSelectorVariableTool: StructuredToolParams = {
  name: "createSelectorVariable",
  description: "Create a variable for a selector",
  schema: createSelectorVariableParams,
};

export const quickSelectorParams = z.object({});
export type TypeQuickSelectorParams = z.infer<typeof quickSelectorParams>;
export const quickSelectorTool: StructuredToolParams = {
  name: "quickSelector",
  description: "Quick tool to get all possible elements in the page and return css selector",
  schema: quickSelectorParams,
};

export const pressKeyParams = z.object({
  key: z.string().describe("keyboard key to press"),
});
export type TypePressKeyParams = z.infer<typeof pressKeyParams>;
export const pressKeyTool: StructuredToolParams = {
  name: "pressKey",
  description: `Press a keyboard key`, // the available key: 'Backspace' | 'Tab' | 'Enter' | 'ShiftLeft' | 'ShiftRight' | 'ControlLeft' | 'ControlRight' | 'AltLeft' | 'AltRight' | 'Escape' | 'Space' | 'PageUp' | 'PageDown' | 'End' | 'ArrowLeft' | 'ArrowUp' | 'ArrowRight' | 'ArrowDown' | 'Select' | 'Open' | 'PrintScreen' | 'Insert' | 'Delete' | 'F1' | 'F2' | 'F3' | 'F4' | 'F5' | 'F6' | 'F7' | 'F8' | 'F9' | 'F10' | 'F11' | 'F12' | 'Shift' | 'Control' | 'Alt'
  schema: pressKeyParams,
};

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
  quickSelectorTool,
  pressKeyTool,
];
