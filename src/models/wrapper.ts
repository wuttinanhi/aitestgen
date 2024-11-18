import { ChatOpenAI } from "@langchain/openai";
import { AIModel, OllamaModelConfig, OpenAIModelConfig } from "./types.ts";
import { ChatOllama, Ollama } from "@langchain/ollama";
import { BaseMessage } from "@langchain/core/messages";

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

export function parseModel(options: any) {
  let model: AIModel;

  if (options.provider === "openai") {
    console.log(`🤖  Using OpenAI model ${options.model}`);

    if (!process.env.OPENAI_API_KEY) {
      console.error("env OPENAI_API_KEY is not set!");
      process.exit(1);
    }

    model = getOpenAIModel({
      model: options.model,
    });
  } else if (options.provider === "ollama") {
    console.log(`🤖  Using Ollama model ${options.model}`);

    if (!options.ollamahost) {
      console.error("Please specify Ollama host with --ollamahost <OLLAMA_ENDPOINT_URL>");
      process.exit(1);
    }

    model = getOllamaModel({
      host: options.ollamahost,
      model: options.model,
    });
  } else {
    throw new Error(`Unknown model provider: ${options.provider}`);
  }

  return model;
}

export function createMessageBuffer() {
  const messageBuffer: Array<BaseMessage> = [];
  return messageBuffer;
}
