export interface WebTestFunctionCall {
  launchBrowser(): Promise<void>;
  navigateTo(url: string): Promise<void>;
  getHtmlSource(): Promise<string>;
  validateElement(selector: string): Promise<boolean>;
  clickElement(selector: string): Promise<void>;
  typeText(selector: string, text: string): Promise<void>;
  expectElementVisible(selector: string, visible: boolean): Promise<boolean>;
  expectElementText(selector: string, text: string): Promise<boolean>;
  getCurrentUrl(): Promise<string>;
  getInputValue(selector: string): Promise<string>;
  closeBrowser(): Promise<void>;
  appendWebTestFunctionCall(call: string): void;
  displayWebTestFunctionCalls(): void;
  complete(): void;
}
