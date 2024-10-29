import { OpenAI } from "openai";

export function appendToolCallResponse(
  messageBuffer: any[],
  toolCall: OpenAI.Chat.Completions.ChatCompletionMessageToolCall,
  resultObject: any
) {
  const toolCallResponse = {
    role: "tool",
    content: JSON.stringify(resultObject),
    tool_call_id: toolCall.id,
  } as OpenAI.ChatCompletionMessageParam;

  messageBuffer.push(toolCallResponse);

  console.log(`Return: ${JSON.stringify(resultObject).slice(0, 100)}`);
}
