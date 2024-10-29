import { ChatOllama } from "@langchain/ollama";
import { ChatOpenAI } from "@langchain/openai";

export type TypeAIModel = ChatOllama | ChatOpenAI;
