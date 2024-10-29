import { ChatOpenAI } from "@langchain/openai";

export const modelOpenAI = new ChatOpenAI({
  model: "gpt-4o-mini-2024-07-18",
  temperature: 0.0,
  cache: true,
  maxTokens: 500,
});
