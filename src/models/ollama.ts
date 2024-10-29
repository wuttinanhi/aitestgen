import { ChatOllama } from "@langchain/ollama";

export const modelOllama = new ChatOllama({
  model: "llama3",
  temperature: 0,
  maxRetries: 2,
});
