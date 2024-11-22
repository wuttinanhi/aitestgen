import { WebController } from "../interfaces/controller.ts";

export class WebControllerProxy {
  public static async callFunction(controller: WebController, functionName: string, functionArgs: any) {
    if (!(functionName in controller)) {
      throw new Error(`no method "${functionName}"`);
    }

    let result = await (controller as any)[functionName](functionArgs);
    return result;
  }
}
