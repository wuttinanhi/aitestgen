import { OpenAI } from "openai";
import { WebTestFunctionCall } from "../engines/interfaces";
import { FrameData } from "../interfaces/FrameData";
import { IStep } from "../interfaces/Step";
import { ToolCallResult } from "../interfaces/ToolCallResult";
import { StepHistory } from "../steps/stephistory";
import { appendToolCallResponse } from "./toolCallResponse";

export async function handleToolCalls(
  engine: WebTestFunctionCall,
  messageBuffer: any[],
  stepBuffer: StepHistory,
  uniqueVariableNamesBuffer: string[],
  toolCall: OpenAI.Chat.Completions.ChatCompletionMessageToolCall
): Promise<ToolCallResult> {
  const functionName = toolCall.function.name;
  const functionArgs = JSON.parse(toolCall.function.arguments);

  // const functionArguments = JSON.parse(toolCall.function.arguments);
  // const functionArgsValue = Object.values(functionArguments);
  // const argsAny = functionArgsValue as any;
  // const variables = functionArguments["varName"];

  console.log(`Invoking tool name: ${functionName}`);
  console.log(`Invoking tool args: ${functionArgs}`);

  // if (variables) {
  //   console.log(`Variable: ${variables}`);
  // }

  try {
    // loop each variable name and check if it has been declared before
    for (const varName of uniqueVariableNamesBuffer) {
      if (uniqueVariableNamesBuffer.includes(varName)) {
        throw new Error(
          `Variable ${varName} already declared. please use a different variable name`
        );
      } else {
        uniqueVariableNamesBuffer.push(varName);
      }
    }

    // if function name is complete, then break the loop
    if (functionName === "complete") {
      // if the last step is not closeBrowser, add it
      if (stepBuffer.latestStep().methodName !== "closeBrowser") {
        const closeBrowserStep: IStep = {
          stepId: 0,
          methodName: "closeBrowser",
          functionArgs: {},
        };
        stepBuffer.createStep(closeBrowserStep);
      }

      appendToolCallResponse(messageBuffer, toolCall, {
        status: "success",
        message: "Backend acknowledged completion",
      });

      return { completed: true };
    }

    // if function name is reset, then reset the engine
    if (functionName === "reset") {
      await engine.reset({});
      stepBuffer.reset();
      uniqueVariableNamesBuffer.length = 0; // clear the unique variable names

      appendToolCallResponse(messageBuffer, toolCall, {
        status: "success",
        message: "Reset browser successfully",
      });

      return { completed: false };
    }

    // Basic function invocation
    // Invoke the function with the extracted arguments
    // prettier-ignore
    // let result = await (engine as any)[functionName](...functionArgsValue);
    let result = await (engine as any)[functionName](functionArgs);

    if (result === undefined || result === null) {
      result = { status: "success" };
    }

    // add the step to the step buffer
    const step: IStep = {
      stepId: 0,
      methodName: functionName,
      functionArgs: functionArgs,
    };

    // if step have variables, add them to the step
    // if (functionArguments["varName"]) {
    //   step.variables = [functionArguments["varName"]];
    // }

    // if command is "iframeGetData" then add the returned data to the step
    if (functionName === "iframeGetData") {
      // remove _internalPage in each frame data
      result.forEach((frameData: FrameData) => {
        delete frameData._internalPage;
      });

      step.iframeGetDataResult = result;
    }

    // if function name contains "expect" the result should always be true to add to the step buffer
    // prettier-ignore
    const shouldAddStep = functionName.includes("expect") ? (result["evaluate_result"] === true) : true;
    if (shouldAddStep) {
      stepBuffer.createStep(step);
    }

    // if result contains pageChanged key then add waitForPageLoad step
    if (result.pageChanged) {
      const waitForPageLoadStep: IStep = {
        stepId: 0,
        methodName: "waitForPageLoad",
        functionArgs: {},
      };
      stepBuffer.createStep(waitForPageLoadStep);
    }

    // push the result back to the messages buffer
    appendToolCallResponse(messageBuffer, toolCall, result);

    return { completed: false };
  } catch (err) {
    const error = err as Error;

    const errorObj = {
      status: "error",
      message: error.message,
    };

    // push the error back to the messages
    appendToolCallResponse(messageBuffer, toolCall, errorObj);

    console.error("Error in invoking function:", errorObj);

    return { completed: false };
  }
}
