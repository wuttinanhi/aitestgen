import OpenAI from "openai";

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

  console.log(`Return: ${JSON.stringify(resultOBJ).slice(0, 100)}`);
}
