import OpenAI from "openai";
import { PuppeteerEngine } from "../engines/puppeteer";
import { TestGenUnexpectedAIResponseError } from "../errors/errors";
import { handleToolCalls } from "../handlers/tools";
import { WebREPLToolsCollection } from "../tools/defs";
import { TestStepGenResult } from "./result";
import { StepHistory } from "./stephistory";

export class TestStepGenerator {
  private llm: OpenAI;
  private systemInstructionPrompt: string;
  private loopHardLimit: number = 30;

  constructor(llm: OpenAI, systemInstructionPrompt: string) {
    this.llm = llm;
    this.systemInstructionPrompt = systemInstructionPrompt;
  }

  setHardLoopLimit(hardLoopLimit: number) {
    this.loopHardLimit = hardLoopLimit;
  }

  async generate(
    userPrompt: string,
    messageBuffer: Array<OpenAI.ChatCompletionMessageParam>
  ) {
    const engine = new PuppeteerEngine();
    const stepHistory = new StepHistory();
    let uniqueVariableNames: string[] = [];
    let TOTAL_TOKENS = 0;

    messageBuffer.push({
      role: "system",
      content: this.systemInstructionPrompt,
    });

    messageBuffer.push({
      role: "user",
      content: userPrompt,
    });

    try {
      loop_hard_limit: for (let i = 0; i < this.loopHardLimit; i++) {
        const response = await this.llm.chat.completions.create({
          model: "gpt-4o-mini",
          messages: messageBuffer,
          tools: WebREPLToolsCollection,
          max_tokens: 500,
          temperature: 0.0,
        });

        console.log(`\n\nLoop: ${i}`);

        const choice = response.choices[0];

        // push the ai response to the messages
        messageBuffer.push(choice.message);

        TOTAL_TOKENS += response.usage?.total_tokens!;

        // if it is function call, execute it
        if (choice.message.tool_calls && choice.message.tool_calls.length > 0) {
          for (const toolCall of choice.message.tool_calls) {
            const functionName = toolCall.function.name;
            const functionArguments = JSON.parse(toolCall.function.arguments);
            const functionArgsValue = Object.values(functionArguments);
            const argsAny = functionArgsValue as any;

            const result = await handleToolCalls(
              engine,
              messageBuffer,
              stepHistory,
              uniqueVariableNames,
              toolCall
            );

            if (result.completed) {
              break loop_hard_limit;
            }
          }
        } else {
          throw new TestGenUnexpectedAIResponseError(choice.message.content);
        }
      }

      const result = new TestStepGenResult(stepHistory, TOTAL_TOKENS);

      return result;
    } catch (error) {
      console.error("Error TestStepGenerator", error);
      throw error;
    } finally {
      await engine.closeBrowser();
    }
  }
}
