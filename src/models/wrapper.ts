import { ChatOpenAI } from "@langchain/openai";
import { AIModel, OllamaModelConfig, OpenAIModelConfig } from "./types.ts";
import { ChatOllama, Ollama } from "@langchain/ollama";

export function getOllamaModel(config: OllamaModelConfig): AIModel {
  return new ChatOllama({
    baseUrl: config.host,
    model: config.model,
    temperature: 0,
    streaming: false,
    cache: true,
  });
}

export function getOpenAIModel(config: OpenAIModelConfig): AIModel {
  return new ChatOpenAI({
    model: config.model,
    temperature: 0.0,
    cache: true,
    maxTokens: 1000,
    streaming: false,
  });
}
