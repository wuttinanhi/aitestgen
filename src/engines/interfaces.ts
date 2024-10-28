import {
  TypeClickElementParams,
  TypeCloseBrowserParams,
  TypeCloseTabParams,
  TypeCompleteParams,
  TypeCreateSelectorVariableParams,
  TypeExpectElementTextParams,
  TypeExpectElementVisibleParams,
  TypeGetCurrentUrlParams,
  TypeGetHtmlSourceParams,
  TypeGetInputValueParams,
  TypeGetOptionValueParams,
  TypeGetTabsParams,
  TypeGoBackHistoryParams,
  TypeGoForwardHistoryParams,
  TypeIframeGetDataParams,
  TypeIframeResetParams,
  TypeIframeSwitchParams,
  TypeLaunchBrowserParams,
  TypeNavigateToParams,
  TypeResetParams,
  TypeSetInputValueParams,
  TypeSetOptionValueParams,
  TypeSetTabParams,
} from "../tools/defs";

export interface WebTestFunctionCall {
  // Browser
  launchBrowser(params: TypeLaunchBrowserParams): Promise<void>;
  closeBrowser(params: TypeCloseBrowserParams): Promise<void>;
  reset(params: TypeResetParams): Promise<void>;
  // Special
  complete(params: TypeCompleteParams): Promise<void>;
  // Data
  getCurrentUrl(params: TypeGetCurrentUrlParams): Promise<string>;
  getHtmlSource(params: TypeGetHtmlSourceParams): Promise<any>;
  // Interaction
  clickElement(params: TypeClickElementParams): Promise<any>;
  setInputValue(params: TypeSetInputValueParams): Promise<any>;
  getInputValue(params: TypeGetInputValueParams): Promise<string>;
  setOptionValue(params: TypeSetOptionValueParams): Promise<any>;
  getOptionValue(params: TypeGetOptionValueParams): Promise<string>;
  // Expect
  expectElementVisible(params: TypeExpectElementVisibleParams): Promise<any>;
  expectElementText(params: TypeExpectElementTextParams): Promise<any>;
  // Navigation
  navigateTo(params: TypeNavigateToParams): Promise<void>;
  goBackHistory(params: TypeGoBackHistoryParams): Promise<void>;
  goForwardHistory(params: TypeGoForwardHistoryParams): Promise<void>;
  // Tabs
  getTabs(params: TypeGetTabsParams): Promise<any>;
  setTab(params: TypeSetTabParams): Promise<void>;
  closeTab(params: TypeCloseTabParams): Promise<void>;
  // Iframe
  iframeGetData(params: TypeIframeGetDataParams): Promise<any>;
  iframeSwitch(params: TypeIframeSwitchParams): Promise<void>;
  iframeReset(params: TypeIframeResetParams): Promise<void>;
  // Selector
  createSelectorVariable(
    params: TypeCreateSelectorVariableParams
  ): Promise<any>;
}
