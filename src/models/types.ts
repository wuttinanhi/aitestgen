import { BaseLanguageModelInput } from "@langchain/core/language_models/base";
import { AIMessageChunk } from "@langchain/core/messages";
import { Runnable } from "@langchain/core/runnables";
import { ChatOllama } from "@langchain/ollama";
import { ChatOpenAI, ChatOpenAICallOptions } from "@langchain/openai";

export type AIModel = ChatOllama | ChatOpenAI;
export type AIWithTools = Runnable<BaseLanguageModelInput, AIMessageChunk, ChatOpenAICallOptions>;

export interface OllamaModelConfig {
  host: string;
  model: string;
}

export interface OpenAIModelConfig {
  model: string;
}
