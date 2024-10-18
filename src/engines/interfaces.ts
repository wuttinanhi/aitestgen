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
  clickElement(selector: string, varNameInTest: string): Promise<any>;
  setInputValue(selector: string, value: any): Promise<any>;
  getInputValue(selector: string): Promise<string>;
  setOptionValue(selector: string, value: any): Promise<any>;
  getOptionValue(selector: string): Promise<string>;
  // Expect
  expectElementVisible(
    selector: string,
    visible: boolean,
    varNameInTest: string
  ): Promise<any>;
  expectElementText(
    selector: string,
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
  iframeSwitch(id: any): Promise<void>;
  iframeReset(): Promise<void>;
}
