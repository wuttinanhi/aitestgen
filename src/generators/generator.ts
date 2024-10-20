import OpenAI from "openai";
import { PuppeteerEngine } from "../engines/puppeteer";
import { handleToolCalls } from "../handlers/tools";
import { StepHistory } from "../steps/stephistory";
import { WebREPLToolsCollection } from "../tools/defs";
import { TestGenUnexpectedAIResponseError } from "./errors";
import { TestStepGenResult } from "../interfaces/TestStepGenResult";

export async function testStepGen(
  SYSTEM_INSTRUCTION_PROMPT: string,
  USER_PROMPT: string,
  LOOP_HARD_LIMIT = 30
) {
  const openai = new OpenAI();
  const engine = new PuppeteerEngine();
  const stepHistory = new StepHistory();
  const messageBuffer: Array<OpenAI.ChatCompletionMessageParam> = [];
  let uniqueVariableNames: string[] = [];
  let TOTAL_TOKENS = 0;

  messageBuffer.push({
    role: "system",
    content: SYSTEM_INSTRUCTION_PROMPT,
  });

  messageBuffer.push({
    role: "user",
    content: USER_PROMPT,
  });

  try {
    loop_hard_limit: for (let i = 0; i < LOOP_HARD_LIMIT; i++) {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: messageBuffer,
        tools: WebREPLToolsCollection,
        max_tokens: 500,
        temperature: 0.0,
      });

      console.log(`Loop: ${i}`);

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
    console.error("Error testStepGen:", error);
    throw error;
  } finally {
    // await engine.closeBrowser();
  }
}
