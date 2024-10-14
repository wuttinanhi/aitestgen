import OpenAI from "openai";
import { PuppeteerWebTest } from "./engines/puppeteer";
import { handleToolCalls } from "./handlers/tools";
import { readFileString, writeFileString } from "./helpers/files";
import { sleep } from "./helpers/utils";
import { StepHistory } from "./steps/stephistory";
import { WebTestFunctionToolsCollection } from "./tools/defs";

async function main() {
  const systemInstruction = await readFileString("prompts/instruction.txt");

  const userPromptFilePath = process.argv[2];
  const USER_PROMPT = await readFileString(userPromptFilePath);
  console.log("User Prompt\n", USER_PROMPT);

  const LOOP_HARD_LIMIT = 30;

  const openai = new OpenAI();

  const engine = new PuppeteerWebTest();

  const stepHistory = new StepHistory();

  const messageBuffer: Array<OpenAI.ChatCompletionMessageParam> = [];

  let uniqueVariableNames: string[] = [];

  let TOTAL_TOKENS = 0;

  messageBuffer.push({
    role: "system",
    content: systemInstruction,
  });

  messageBuffer.push({
    role: "user",
    content: USER_PROMPT,
  });

  try {
    // await engine.launchBrowser();

    loop_hard_limit: for (let i = 0; i < LOOP_HARD_LIMIT; i++) {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: messageBuffer,
        tools: WebTestFunctionToolsCollection,
        max_tokens: 500,
        temperature: 0.0,
      });

      console.log(`\n\nLoop: ${i}`);

      const choice = response.choices[0];

      // push the ai response to the messages
      messageBuffer.push(choice.message);

      TOTAL_TOKENS += response.usage?.total_tokens || 0;

      // if it is function call, execute it
      if (choice.message.tool_calls && choice.message.tool_calls.length > 0) {
        for (const toolCall of choice.message.tool_calls) {
          const functionName = toolCall.function.name;
          const functionArguments = JSON.parse(toolCall.function.arguments);
          const functionArgsValue = Object.values(functionArguments);
          const argsAny = functionArgsValue as any;

          // if function name is complete, then break the loop
          if (functionName === "complete") {
            break loop_hard_limit;
          }

          await handleToolCalls(
            engine,
            messageBuffer,
            stepHistory,
            uniqueVariableNames,
            toolCall
          );
        }
      } else {
        console.log("AI chat:", choice.message.content);
        process.exit(1);
      }

      await sleep(1000);
    }
  } catch (error) {
    console.error("Error in main loop", error);
    console.error(error);
  } finally {
    await engine.closeBrowser();

    const stepsJSON = stepHistory.toJSONString();
    console.log("Steps JSON", stepsJSON);

    await writeFileString("generated/out.steps.json", stepsJSON);

    console.log("Total Tokens Used:", TOTAL_TOKENS);
  }
}

main();
