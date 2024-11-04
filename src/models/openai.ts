import { ChatOpenAI } from "@langchain/openai";

export const modelOpenAI = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0.0,
  cache: true,
  maxTokens: 500,
  streaming: false,
});
