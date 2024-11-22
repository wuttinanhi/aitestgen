export class PageNotFoundError extends Error {
  constructor() {
    super("Active page not found");
  }
}

export class ElementNotFoundError extends Error {
  constructor() {
    super("Element not found");
  }
}

export class BrowserAlreadyLaunchedError extends Error {
  constructor() {
    super("Browser already launched");
  }
}

export class ElementBySelectorNotFoundError extends Error {
  constructor(selectorType: string, selectorValue: string) {
    super(`Element not found with type ${selectorType} "${selectorValue}"`);
  }
}

export class BrowserNotLaunchedError extends Error {
  constructor() {
    super("Browser not launched. you need to launch it.");
  }
}
