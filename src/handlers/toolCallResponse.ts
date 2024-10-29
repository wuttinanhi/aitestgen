import { BaseMessage } from "@langchain/core/messages";
import { ToolCall, ToolMessage } from "@langchain/core/messages/tool";

export function appendToolCallResponse(messageBuffer: Array<BaseMessage>, toolCall: ToolCall, resultObject: any) {
  const toolCallResponse = new ToolMessage(
    {
      content: JSON.stringify(resultObject),
    },
    toolCall.id!,
  );

  messageBuffer.push(toolCallResponse);
}
