export interface WebTestFunctionCall {
  // Browser
  launchBrowser(): Promise<void>;
  closeBrowser(): Promise<void>;
  reset(): Promise<void>;
  // Special
  complete(): Promise<void>;
  // Data
  getCurrentUrl(): Promise<string>;
  getHtmlSource(): Promise<any>;
  // Interaction
  clickElement(varSelector: string, varNameInTest: string): Promise<any>;
  setInputValue(varSelector: string, value: any): Promise<any>;
  getInputValue(varSelector: string): Promise<string>;
  setOptionValue(varSelector: string, value: any): Promise<any>;
  getOptionValue(varSelector: string): Promise<string>;
  // Expect
  expectElementVisible(
    varSelector: string,
    visible: boolean,
    varNameInTest: string
  ): Promise<any>;
  expectElementText(
    varSelector: string,
    text: string,
    varNameInTest: string
  ): Promise<any>;
  // Navigation
  navigateTo(url: string): Promise<void>;
  goBackHistory(): Promise<void>;
  goForwardHistory(): Promise<void>;
  // Tabs
  getTabs(): Promise<any>;
  setTab(tabId: number): Promise<void>;
  closeTab(tabId: number): Promise<void>;
  // Iframe
  iframeGetData(): Promise<any>;
  iframeSwitch(index: any): Promise<void>;
  iframeReset(): Promise<void>;
  // Selector
  createSelectorVariable(
    varNameInTest: string,
    selectorType: string,
    selectorValue: string
  ): Promise<any>;
}
