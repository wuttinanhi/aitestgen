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
  launchBrowser(params: TypeLaunchBrowserParams): Promise<any>;
  closeBrowser(params: TypeCloseBrowserParams): Promise<any>;
  reset(params: TypeResetParams): Promise<any>;
  // Special
  complete(params: TypeCompleteParams): Promise<any>;
  // Data
  getCurrentUrl(params: TypeGetCurrentUrlParams): Promise<any>;
  getHtmlSource(params: TypeGetHtmlSourceParams): Promise<any>;
  // Interaction
  clickElement(params: TypeClickElementParams): Promise<any>;
  setInputValue(params: TypeSetInputValueParams): Promise<any>;
  getInputValue(params: TypeGetInputValueParams): Promise<any>;
  setOptionValue(params: TypeSetOptionValueParams): Promise<any>;
  getOptionValue(params: TypeGetOptionValueParams): Promise<any>;
  // Expect
  expectElementVisible(params: TypeExpectElementVisibleParams): Promise<any>;
  expectElementText(params: TypeExpectElementTextParams): Promise<any>;
  // Navigation
  navigateTo(params: TypeNavigateToParams): Promise<any>;
  goBackHistory(params: TypeGoBackHistoryParams): Promise<any>;
  goForwardHistory(params: TypeGoForwardHistoryParams): Promise<any>;
  // Tabs
  getTabs(params: TypeGetTabsParams): Promise<any>;
  setTab(params: TypeSetTabParams): Promise<any>;
  closeTab(params: TypeCloseTabParams): Promise<any>;
  // Iframe
  iframeGetData(params: TypeIframeGetDataParams): Promise<any>;
  iframeSwitch(params: TypeIframeSwitchParams): Promise<any>;
  iframeReset(params: TypeIframeResetParams): Promise<any>;
  // Selector
  createSelectorVariable(
    params: TypeCreateSelectorVariableParams
  ): Promise<any>;
}
