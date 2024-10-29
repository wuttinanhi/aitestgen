import { AIMessage, BaseMessage, SystemMessage } from "@langchain/core/messages";
import { TypeAIModel } from "../models/types";
import { StepHistory } from "../steps/stephistory";
import { FinalizeParamsType, finalizeTool } from "../tools/finalizer";
import { appendToolCallResponse } from "./toolCallResponse";

export async function handleFinalize(
  SYSTEM_FINALIZE_PROMPT: string,
  llm: TypeAIModel,
  messageBuffer: Array<BaseMessage>,
  stepBuffer: StepHistory,
) {
  messageBuffer.push(
    new SystemMessage({
      content: SYSTEM_FINALIZE_PROMPT,
    }),
  );

  const stepJSON = JSON.stringify(stepBuffer.getAll());

  messageBuffer.push(
    new AIMessage({
      content: stepJSON,
    }),
  );

  // BIND TOOLS finalizer
  llm.bindTools([finalizeTool], {
    tool_choice: "finalize",
  });
  const response = await llm.invoke(messageBuffer);

  messageBuffer.push(response);

  if (!response.tool_calls) {
    throw new Error("No tool calls found in response");
  }

  const toolCall = response.tool_calls[0];

  const functionName = toolCall.name;
  const functionArguments: FinalizeParamsType = toolCall.args as any;

  console.log(toolCall.args);

  const selectedSteps = functionArguments.steps;

  console.log(`Invoking tools: ${functionName}`);

  appendToolCallResponse(messageBuffer, toolCall, {
    status: "success",
  });

  return {
    selectedSteps,
    totalTokens: response.usage_metadata ? response.usage_metadata.total_tokens : 0,
  };
}
