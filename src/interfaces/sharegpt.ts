export interface ShareGPTMessage {
  role: "human" | "gpt" | "system" | "tool_call" | "tool_response";
  content: string;
}
