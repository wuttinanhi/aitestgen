export interface WebTestFunctionCall {
  launchBrowser(): Promise<void>;
  navigateTo(url: string): Promise<void>;
  getHtmlSource(): Promise<any>;
  validateElement(selector: string): Promise<boolean>;
  clickElement(selector: string): Promise<any>;
  setInputValue(selector: string, value: any): Promise<any>;
  expectElementVisible(selector: string, visible: boolean): Promise<boolean>;
  expectElementText(selector: string, text: string): Promise<any>;
  getCurrentUrl(): Promise<string>;
  getInputValue(selector: string): Promise<string>;
  closeBrowser(): Promise<void>;
}
