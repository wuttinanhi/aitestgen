import { WebEngine } from "src/interfaces/engine";

export class WebControllerProxy {
  public static async callFunction(controller: WebEngine, functionName: string, functionArgs: any) {
    let result = await (controller as any)[functionName](functionArgs);
    return result;
  }
}
