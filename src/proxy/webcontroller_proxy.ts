import { WebController } from "testgenwebcontroller";

export class WebControllerProxy {
  public static async callFunction(controller: WebController, functionName: string, functionArgs: any) {
    let result = await (controller as any)[functionName](functionArgs);
    return result;
  }
}
