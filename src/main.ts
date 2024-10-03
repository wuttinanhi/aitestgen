import OpenAI, { BadRequestError } from "openai";
import PuppeteerWebTest from "./engines/puppeteer";
import { readFileString } from "./helpers/helpers";
import { loadTools } from "./helpers/tools";

async function main() {
  const toolsDefinition = (await loadTools(
    "./tools"
  )) as Array<OpenAI.ChatCompletionTool>;
  // for (const tool of toolsDefinition) {
  //   console.log(tool);
  // }

  const systemInstruction = await readFileString("prompts/instruction.txt");

  const EXAMPLE_1 = await readFileString("prompts/example1.txt");

  const LOOP_HARD_LIMIT = 35;

  const openai = new OpenAI();

  const engine = new PuppeteerWebTest();

  const messages: Array<OpenAI.ChatCompletionMessageParam> = [];

  messages.push({
    role: "system",
    content: systemInstruction,
  });
  messages.push({
    role: "user",
    content: EXAMPLE_1,
  });

  // const response = await openai.chat.completions.create({
  //   model: "gpt-4o-mini",
  //   messages: messages,
  //   tools: toolsDefinition,
  // });

  // const choice = response.choices[0];

  // messages.push(choice.message);
  // console.log(choice.message);

  try {
    loop_hard_limit: for (let i = 0; i < LOOP_HARD_LIMIT; i++) {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: messages,
        tools: toolsDefinition,
      });

      console.log(`\n\nLoop: ${i}`);

      const choice = response.choices[0];

      // console.log("choice", choice.message);

      // push the message to the messages
      messages.push(choice.message);

      // if it is function call, execute it
      if (choice.message.tool_calls && choice.message.tool_calls.length > 0) {
        // loop through the tool calls and execute them
        for (const toolCall of choice.message.tool_calls) {
          const functionName = toolCall.function.name;
          const functionArguments = JSON.parse(toolCall.function.arguments);

          console.log(`Function call detected: ${functionName}`);
          // console.log(`Function arguments: ${functionArguments}`);

          try {
            // Extract values from the functionArguments object
            const args = Object.values(functionArguments);
            console.log("Args", args);

            // Invoke the function with the extracted arguments
            const result = await (engine as any)[functionName](...args);

            const resultString = JSON.stringify(
              result === undefined ? {} : result
            );
            const trimmedResult =
              resultString.length > 500
                ? resultString.substring(0, 500) + "..."
                : resultString;
            console.log("Result", trimmedResult);

            // push the result back to the messages

            messages.push({
              role: "tool",
              content: JSON.stringify(result === undefined ? {} : result),
              tool_call_id: toolCall.id,
            });
          } catch (e) {
            const error = e as Error;

            console.error("error in invoking function", error);

            // push the error back to the messages
            messages.push({
              role: "tool",
              content: error.message,
              tool_call_id: toolCall.id,
            });
          }

          // if function name is complete, then break the loop
          if (functionName === "complete") {
            break loop_hard_limit;
          }
        }
      }

      // await sleep(1000);
    }
  } catch (error) {
    if (error instanceof BadRequestError) {
      console.error(error.message);
      // dump the messages
      console.log(messages);
    } else {
      console.error(error);
    }
  } finally {
    await engine.closeBrowser();
  }
}

main();
