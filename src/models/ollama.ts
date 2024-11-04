import { ChatOllama } from "@langchain/ollama";

export const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:8000";

// model: llama3.1:8b-instruct-q2_K
// model: llama3.1
export const modelOllama = new ChatOllama({
  baseUrl: OLLAMA_URL,
  model: "llama3.1",
  temperature: 0,
  // maxRetries: 2,
  streaming: false,
  // numCtx: 100000,
});
