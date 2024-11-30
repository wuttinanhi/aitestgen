// deno-lint-ignore-file require-await no-unused-vars no-explicit-any no-empty
import { WebController } from "../interfaces/controller.ts";
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
  TypeIframeGetDataParams,
  TypeIframeResetParams,
  TypeIframeSwitchParams,
  TypeLaunchBrowserParams,
  TypeNavigateToParams,
  TypePressKeyParams,
  TypeQuickSelectorParams,
  TypeResetParams,
  TypeSetInputValueParams,
  TypeSetOptionValueParams,
  TypeSetTabParams,
} from "../tools/defs.ts";
import { PuppeteerController } from "./puppeteer.controller.ts";

export class PuppeteerTextController extends PuppeteerController implements WebController {
  async launchBrowser(params: TypeLaunchBrowserParams) {
    await super.launchBrowser(params);
    return "browser launched";
  }

  async closeBrowser(params: TypeCloseBrowserParams): Promise<any> {
    await super.closeBrowser(params);
    return "browser closed";
  }

  public async reset(params: TypeResetParams): Promise<any> {
    await super.reset(params);
    return "reset done";
  }

  public async complete(params: TypeCompleteParams): Promise<any> {
    return "completed";
  }

  public async getCurrentUrl(params: TypeGetCurrentUrlParams): Promise<any> {
    const newURL = await super.getCurrentUrl(params);
    return `navigated to: ${newURL}`;
  }

  public async getHtmlSource(params: TypeGetHtmlSourceParams): Promise<any> {
    const result = await super.getHtmlSource(params);
    return `Current URL: ${result.url}\nHTML Source: ${result.html}`;
  }

  public async clickElement(params: TypeClickElementParams): Promise<any> {
    const result = await super.clickElement(params);
    return result;
  }

  public async setInputValue(params: TypeSetInputValueParams): Promise<any> {
    await super.setInputValue(params);
    return "done";
  }

  public async getInputValue(params: TypeGetInputValueParams): Promise<any> {
    const result = await super.getInputValue(params);
    return `value: ${result}`;
  }

  public async setOptionValue(params: TypeSetOptionValueParams): Promise<any> {
    await super.setOptionValue(params);
    return "done";
  }

  public async getOptionValue(params: TypeGetOptionValueParams): Promise<any> {
    const result = await super.getOptionValue(params);
    return `value: ${result}`;
  }

  public async pressKey(params: TypePressKeyParams): Promise<any> {
    await super.pressKey(params);
    return "done";
  }

  public async expectElementVisible(params: TypeExpectElementVisibleParams): Promise<any> {
    const result = await super.expectElementVisible(params);
    return result;
  }

  public async expectElementText(params: TypeExpectElementTextParams): Promise<any> {
    const result = await super.expectElementText(params);
    return result;
  }

  public async navigateTo(params: TypeNavigateToParams): Promise<any> {
    const newURL = await super.navigateTo(params);
    return `new url: ${newURL}`;
  }

  public async goBackHistory(): Promise<any> {
    await super.goBackHistory();
    return "go back done";
  }

  public async goForwardHistory(): Promise<any> {
    await super.goForwardHistory();
    return "go forward done";
  }

  public async getTabs(params: TypeGetTabsParams): Promise<any> {
    const result = await super.getTabs(params);
    return result;
  }

  public async setTab(params: TypeSetTabParams): Promise<any> {
    await super.setTab(params);
    return `set tab to ${params.tabId}`;
  }

  public async closeTab(params: TypeCloseTabParams): Promise<any> {
    await super.closeTab(params);
    return "tab closed";
  }

  public async iframeGetData(params: TypeIframeGetDataParams): Promise<any> {
    const result = await super.iframeGetData(params);
    return result;
  }

  public async iframeSwitch(params: TypeIframeSwitchParams): Promise<any> {
    await super.iframeSwitch(params);
    return `iframe switched`;
  }

  public async iframeReset(params: TypeIframeResetParams): Promise<any> {
    await super.iframeReset(params);
    return `iframe reset done`;
  }

  public async createSelectorVariable(params: TypeCreateSelectorVariableParams): Promise<any> {
    const result = await super.createSelectorVariable(params);
    return result;
  }

  public async quickSelector(params: TypeQuickSelectorParams): Promise<any> {
    const reset = await super.quickSelector(params);
    return reset;
  }
}
