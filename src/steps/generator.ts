import { BaseMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import { PuppeteerEngine } from "../engines/puppeteer";
import { handleToolCalls } from "../handlers/tools";
import { AIModel } from "../models/types";
import { WebREPLToolsCollection } from "../tools/defs";
import { TestStepGenResult } from "./result";
import { StepHistory } from "./stephistory";

export class TestStepGenerator {
  private llm: AIModel;
  private systemInstructionPrompt: string;
  private loopHardLimit: number = 30;

  constructor(llm: AIModel, systemInstructionPrompt: string) {
    this.llm = llm;
    this.systemInstructionPrompt = systemInstructionPrompt;
  }

  setHardLoopLimit(hardLoopLimit: number) {
    this.loopHardLimit = hardLoopLimit;
  }

  async generate(userPrompt: string, messageBuffer: Array<BaseMessage>) {
    const engine = new PuppeteerEngine();
    const stepHistory = new StepHistory();
    let uniqueVariableNames: string[] = [];
    let TOTAL_TOKENS = 0;

    messageBuffer.push(
      new SystemMessage({
        content: this.systemInstructionPrompt,
      }),
    );

    messageBuffer.push(
      new HumanMessage({
        content: userPrompt,
      }),
    );

    try {
      const aiWithTools = this.llm.bindTools(WebREPLToolsCollection);

      loop_hard_limit: for (let i = 0; i < this.loopHardLimit; i++) {
        const response = await aiWithTools.invoke(messageBuffer);

        console.log(`LOOP: ${i + 1}`);

        messageBuffer.push(response);

        TOTAL_TOKENS += response.usage_metadata!.total_tokens;

        // if it is function call, execute it
        if (response.tool_calls && response.tool_calls.length > 0) {
          for (const toolCall of response.tool_calls) {
            const functionName = toolCall.name;
            const functionArguments = toolCall.args;

            // const functionArgsValue = Object.values(functionArguments);
            // const argsAny = functionArgsValue as any;

            await handleToolCalls(engine, messageBuffer, stepHistory, uniqueVariableNames, toolCall);

            if (functionName === "complete") {
              break loop_hard_limit;
            }
          }
        } else {
          // throw new TestGenUnexpectedAIResponseError(response.content);

          console.log(`Error! No tool calls found. tcl: ${response.tool_calls!.length}`);

          messageBuffer.push(
            new SystemMessage({
              content: "Error! No tool calls found. Please use tool calls now!",
            }),
          );

          continue;
        }
      }

      const result = new TestStepGenResult(stepHistory, TOTAL_TOKENS);

      return result;
    } catch (error) {
      console.error("Error TestStepGenerator", error);
      throw error;
    } finally {
      await engine.closeBrowser({});
    }
  }
}
