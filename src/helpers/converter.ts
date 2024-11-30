import { AIMessage, BaseMessage, HumanMessage, SystemMessage, ToolMessage } from "@langchain/core/messages";
import { ShareGPTMessage } from "../interfaces/sharegpt.ts";

export function convertLangchainBaseMessageToShareGPT(messages: BaseMessage[]): ShareGPTMessage[] {
  const results: ShareGPTMessage[] = [];

  for (const message of messages) {
    if (message instanceof AIMessage) {
      // convert to tool call
      // if message have tool calls
      if (message.tool_calls && message.tool_calls.length > 0) {
        // loop all tool calls
        for (const call of message.tool_calls) {
          const argumentsOBJ = call.args;
          // const argumentsJSON = JSON.stringify(argumentsOBJ);

          const callObj = {
            name: call.name,
            arguments: argumentsOBJ,
            tool_call_request_id: call.id,
          };

          const callJSON = JSON.stringify(callObj);

          results.push({
            role: "tool_call",
            content: `<functioncall> ${callJSON} </functioncall>`,
          } as ShareGPTMessage);
        }

        continue;
      }

      // normal ai message
      results.push({
        role: "gpt",
        content: message.content,
      } as ShareGPTMessage);
    } else if (message instanceof HumanMessage) {
      results.push({
        role: "human",
        content: message.content,
      } as ShareGPTMessage);
    } else if (message instanceof SystemMessage) {
      results.push({
        role: "system",
        content: message.content,
      } as ShareGPTMessage);
    } else if (message instanceof ToolMessage) {
      results.push({
        role: "tool_response",
        content: message.content,
        tool_call_response_id: message.tool_call_id,
      } as ShareGPTMessage);
    } else {
      throw new Error(`Unsupported message type: ${message.constructor.name}`);
    }
  }

  return results;
}
