import OpenAI from "openai";
import { WebTestFunctionCall } from "../engines/interfaces";
import { StepHistory } from "../steps/stephistory";

export function toolCallResponse(
  messageBuffer: any[],
  toolCallId: any,
  resultOBJ: any
) {
  const toolCallResponse = {
    role: "tool",
    content: JSON.stringify(resultOBJ),
    tool_call_id: toolCallId,
  } as OpenAI.ChatCompletionMessageParam;

  messageBuffer.push(toolCallResponse);

  console.log(
    `Tool Result Length: ${resultOBJ.length} Data: ${JSON.stringify(resultOBJ).slice(0, 100)}`
  );
}

export async function handleToolCalls(
  engine: WebTestFunctionCall,
  messageBuffer: any[],
  stepBuffer: StepHistory,
  toolCall: OpenAI.Chat.Completions.ChatCompletionMessageToolCall
) {
  const functionName = toolCall.function.name;
  const functionArguments = JSON.parse(toolCall.function.arguments);
  const functionArgsValue = Object.values(functionArguments);
  const argsAny = functionArgsValue as any;

  console.log(`Invoking tools: ${functionName} with args ${argsAny ?? "null"}`);

  try {
    // Basic function invocation
    // Invoke the function with the extracted arguments
    // prettier-ignore
    let result = await (engine as any)[functionName](...functionArgsValue);

    if (result === undefined || result === null) {
      result = {
        status: "success",
        message: "function executed successfully and returned void",
      };
    }

    toolCallResponse(messageBuffer, toolCall.id, result);

    stepBuffer.createStep({
      methodName: functionName,
      args: argsAny,
    });
  } catch (err) {
    const error = err as Error;
    console.error("error in invoking function", error);

    const errorObj = {
      status: "error",
      message: error.message,
    };

    // push the error back to the messages
    toolCallResponse(messageBuffer, toolCall.id, errorObj);
  }
}
