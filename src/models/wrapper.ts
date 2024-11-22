import { BaseMessage } from "@langchain/core/messages";
import { ChatOllama } from "@langchain/ollama";
import { ChatOpenAI } from "@langchain/openai";
import { AIModel, OllamaModelConfig, OpenAIModelConfig, ParseModelOptions } from "./types.ts";

export function getOllamaModel(config: OllamaModelConfig): AIModel {
  return new ChatOllama({
    baseUrl: config.ollamahost,
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

export function parseModel(options: ParseModelOptions) {
  let model: AIModel;

  switch (options.provider) {
    case "openai":
      const openAIConfig = options as OpenAIModelConfig;

      console.log(`Using OpenAI model ${openAIConfig.model}`);

      if (!process.env.OPENAI_API_KEY) {
        console.error("env OPENAI_API_KEY is not set!");
        process.exit(1);
      }

      model = getOpenAIModel({ model: openAIConfig.model });

      return model;
    case "ollama":
      const ollamaConfig = options as OllamaModelConfig;

      console.log(`Using Ollama model ${ollamaConfig.model}`);

      if (!ollamaConfig.ollamahost) {
        console.error("Please specify Ollama host with --ollamahost <OLLAMA_ENDPOINT_URL>");
        process.exit(1);
      }

      model = getOllamaModel({
        ollamahost: ollamaConfig.ollamahost,
        model: ollamaConfig.model,
      });

      return model;
    default:
      throw new Error(`Unknown model provider: ${options.provider}`);
  }
}

export function createMessageBuffer() {
  const messageBuffer: Array<BaseMessage> = [];
  return messageBuffer;
}
