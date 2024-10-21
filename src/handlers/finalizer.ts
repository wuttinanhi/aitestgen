import OpenAI from "openai";
import { StepHistory } from "../steps/stephistory";
import { FinalizeParamsType, finalizeTool } from "../tools/finalizer";
import { appendToolCallResponse } from "./toolCallResponse";

export async function handleFinalize(
  SYSTEM_FINALIZE_PROMPT: string,
  llm: OpenAI,
  messageBuffer: Array<OpenAI.ChatCompletionMessageParam>,
  stepBuffer: StepHistory
) {
  messageBuffer.push({
    role: "system",
    content: SYSTEM_FINALIZE_PROMPT,
  });

  const stepJSON = JSON.stringify(stepBuffer.getAll());

  messageBuffer.push({
    role: "assistant",
    content: stepJSON,
  });

  const response = await llm.chat.completions.create({
    model: "gpt-4o-mini",
    messages: messageBuffer,
    tools: [finalizeTool],
    max_tokens: 500,
    temperature: 0.0,
  });

  const choice = response.choices[0];
  messageBuffer.push(choice.message);

  if (!choice.message.tool_calls) {
    throw new Error("No tool calls found in response");
  }

  const toolCall = choice.message.tool_calls[0];

  const functionName = toolCall.function.name;
  const functionArguments: FinalizeParamsType = JSON.parse(
    toolCall.function.arguments
  );

  const selectedSteps = functionArguments.steps;

  console.log(`Invoking tools: ${functionName}`);

  appendToolCallResponse(messageBuffer, toolCall, {
    status: "success",
  });

  return {
    selectedSteps,
    totalTokens: response.usage ? response.usage.total_tokens : 0,
  };
}
