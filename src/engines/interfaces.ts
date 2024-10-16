export interface WebTestFunctionCall {
  launchBrowser(): Promise<void>;
  getTabs(): Promise<any>;
  switchTab(tabId: number): Promise<void>;
  navigateTo(url: string): Promise<void>;
  getHtmlSource(): Promise<any>;
  clickElement(selector: string, varNameInTest: string): Promise<any>;
  setInputValue(selector: string, value: any): Promise<any>;
  getInputValue(selector: string): Promise<string>;
  setOptionValue(selector: string, value: any): Promise<any>;
  getOptionValue(selector: string): Promise<string>;
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
  getCurrentUrl(): Promise<string>;
  closeBrowser(): Promise<void>;
  complete(): Promise<void>;
  reset(): Promise<void>;
  // wrapperGetElement(selector: string): Promise<any[]>;
  // getIframesData(): Promise<any>;
  // switchToIframe(selector: string): Promise<void>;
  goBackHistory(): Promise<void>;
  goForwardHistory(): Promise<void>;
}
