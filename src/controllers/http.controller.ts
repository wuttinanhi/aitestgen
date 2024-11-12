// deno-lint-ignore-file no-explicit-any no-unused-vars
import { WebController } from "../index.ts";
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
} from "../tools/defs.ts";

// call browser controller over http
export class HTTPController implements WebController {
  launchBrowser(params: TypeLaunchBrowserParams): Promise<any> {
    throw new Error("Method not implemented.");
  }

  closeBrowser(params: TypeCloseBrowserParams): Promise<any> {
    throw new Error("Method not implemented.");
  }

  reset(params: TypeResetParams): Promise<any> {
    throw new Error("Method not implemented.");
  }

  complete(params: TypeCompleteParams): Promise<any> {
    throw new Error("Method not implemented.");
  }

  getCurrentUrl(params: TypeGetCurrentUrlParams): Promise<any> {
    throw new Error("Method not implemented.");
  }

  getHtmlSource(params: TypeGetHtmlSourceParams): Promise<any> {
    throw new Error("Method not implemented.");
  }

  clickElement(params: TypeClickElementParams): Promise<any> {
    throw new Error("Method not implemented.");
  }

  setInputValue(params: TypeSetInputValueParams): Promise<any> {
    throw new Error("Method not implemented.");
  }

  getInputValue(params: TypeGetInputValueParams): Promise<any> {
    throw new Error("Method not implemented.");
  }

  setOptionValue(params: TypeSetOptionValueParams): Promise<any> {
    throw new Error("Method not implemented.");
  }

  getOptionValue(params: TypeGetOptionValueParams): Promise<any> {
    throw new Error("Method not implemented.");
  }

  expectElementVisible(params: TypeExpectElementVisibleParams): Promise<any> {
    throw new Error("Method not implemented.");
  }

  expectElementText(params: TypeExpectElementTextParams): Promise<any> {
    throw new Error("Method not implemented.");
  }

  navigateTo(params: TypeNavigateToParams): Promise<any> {
    throw new Error("Method not implemented.");
  }

  goBackHistory(params: TypeGoBackHistoryParams): Promise<any> {
    throw new Error("Method not implemented.");
  }

  goForwardHistory(params: TypeGoForwardHistoryParams): Promise<any> {
    throw new Error("Method not implemented.");
  }

  getTabs(params: TypeGetTabsParams): Promise<any> {
    throw new Error("Method not implemented.");
  }

  setTab(params: TypeSetTabParams): Promise<any> {
    throw new Error("Method not implemented.");
  }

  closeTab(params: TypeCloseTabParams): Promise<any> {
    throw new Error("Method not implemented.");
  }

  iframeGetData(params: TypeIframeGetDataParams): Promise<any> {
    throw new Error("Method not implemented.");
  }

  iframeSwitch(params: TypeIframeSwitchParams): Promise<any> {
    throw new Error("Method not implemented.");
  }

  iframeReset(params: TypeIframeResetParams): Promise<any> {
    throw new Error("Method not implemented.");
  }

  createSelectorVariable(
    params: TypeCreateSelectorVariableParams,
  ): Promise<any> {
    throw new Error("Method not implemented.");
  }
}
