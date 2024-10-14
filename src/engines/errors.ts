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
