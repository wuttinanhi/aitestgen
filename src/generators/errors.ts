export class TestGenUnexpectedAIResponseError extends Error {
  private response: any;

  constructor(response: any) {
    super("Unexpected AI Response");
    this.response = response;
  }

  public getResponse() {
    return this.response;
  }
}
