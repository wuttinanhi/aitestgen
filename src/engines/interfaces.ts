export interface WebTestFunctionCall {
  launchBrowser(): Promise<void>;
  navigateTo(url: string): Promise<void>;
  getHtmlSource(): Promise<any>;
  clickElement(selector: string): Promise<any>;
  setInputValue(selector: string, value: any): Promise<any>;
  getInputValue(selector: string): Promise<string>;
  setOptionValue(selector: string, value: any): Promise<any>;
  getOptionValue(selector: string): Promise<string>;
  expectElementVisible(selector: string, visible: boolean): Promise<boolean>;
  expectElementText(selector: string, text: string): Promise<any>;
  getCurrentUrl(): Promise<string>;
  closeBrowser(): Promise<void>;
  complete(): Promise<void>;
  // wrapperGetElement(selector: string): Promise<any[]>;
  // getIframesData(): Promise<any>;
  // switchToIframe(selector: string): Promise<void>;
}
