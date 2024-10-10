import OpenAI from "openai";
import PuppeteerWebTest from "./engines/puppeteer";
import { readFileString } from "./helpers/files";
import { loadTools } from "./helpers/tools";
import { sleep } from "./helpers/utils";
import { StepHistory } from "./steps/stephistory";

async function main() {
  const toolsDefinition = (await loadTools(
    "./tools"
  )) as Array<OpenAI.ChatCompletionTool>;
  // for (const tool of toolsDefinition) {
  //   console.log(tool);
  // }

  const systemInstruction = await readFileString("prompts/instruction.txt");

  // const USER_PROMPT = await readFileString("prompts/example5-stripe.txt");
  const USER_PROMPT = await readFileString("prompts/example1.txt");

  const LOOP_HARD_LIMIT = 30;

  const openai = new OpenAI();

  const engine = new PuppeteerWebTest();

  const stepHistory = new StepHistory();

  const messages: Array<OpenAI.ChatCompletionMessageParam> = [];

  async function chooseWantedSteps(stepIndexs: number[]) {
    // console.log("chooseWantedSteps", stepIndexs);

    const steps = stepHistory.listSteps();
    for (const step of steps) {
      console.log(">>>", step.methodName, step.methodArguments);
    }

    await stepHistory.generateTestOnSelectedStep(stepIndexs);
  }

  messages.push({
    role: "system",
    content: systemInstruction,
  });
  messages.push({
    role: "user",
    content: USER_PROMPT,
  });

  try {
    loop_hard_limit: for (let i = 0; i < LOOP_HARD_LIMIT; i++) {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: messages,
        tools: toolsDefinition,
        max_tokens: 500,
      });

      console.log(`\n\n\nLoop: ${i}`);

      const choice = response.choices[0];

      // push the ai response to the messages
      messages.push(choice.message);

      // if it is function call, execute it
      if (choice.message.tool_calls && choice.message.tool_calls.length > 0) {
        // loop through the tool calls and execute them
        for (const toolCall of choice.message.tool_calls) {
          const functionName = toolCall.function.name;
          const functionArguments = JSON.parse(toolCall.function.arguments);
          const functionArgsValue = Object.values(functionArguments);
          const argsAny = functionArgsValue as any;

          console.log(`functionName: ${functionName}`);
          console.log("functionArguments", functionArgsValue);

          // if function name is complete, then break the loop
          if (functionName === "complete") {
            break loop_hard_limit;
          }

          // if function name is chooseWantedSteps, then break the loop
          if (functionName === "chooseWantedSteps") {
            await chooseWantedSteps(argsAny[0]);
            break loop_hard_limit;
          }

          function toolCallResponse(toolCallId: any, result: any) {
            const toolCallResponse = {
              role: "tool",
              content: JSON.stringify(result),
              tool_call_id: toolCallId,
            } as OpenAI.ChatCompletionMessageParam;
            messages.push(toolCallResponse);

            // log the result limited to 100 characters
            if (typeof result === "string" && result.length > 100) {
              console.log("Tool Result Length", result.length);
              console.log("Tool Result", result.slice(0, 100));
            } else {
              console.log("Tool Result", result);
            }
          }

          async function handleBasicFunctionCall() {
            try {
              // Basic function invocation
              // Invoke the function with the extracted arguments
              let result = await (engine as any)[functionName](
                ...functionArgsValue
              );

              if (result === undefined || result === null) {
                result = {
                  status: "success",
                  message:
                    "Function executed successfully and returned nothing",
                };
              }

              toolCallResponse(toolCall.id, result);
            } catch (err) {
              const error = err as Error;
              console.error("error in invoking function", error);

              // push the error back to the messages
              messages.push({
                role: "tool",
                content: JSON.stringify({
                  status: "error",
                  message: error.message,
                }),
                tool_call_id: toolCall.id,
              });
            }
          }

          // if function name is step history
          switch (functionName) {
            case "createStep":
              stepHistory.createStep({
                methodName: argsAny[0]["methodName"],
                methodArguments: argsAny[0]["methodArguments"],
              });
              toolCallResponse(toolCall.id, {
                status: "success",
                message: "Step created successfully",
              });
              break;
            case "updateStep":
              stepHistory.updateStep(argsAny[0]["stepIndex"], {
                methodName: argsAny[0]["methodName"],
                methodArguments: argsAny[0]["methodArguments"],
              });
              toolCallResponse(toolCall.id, {
                status: "success",
                message: "Step updated successfully",
              });
              break;
            case "bulkDeleteSteps":
              stepHistory.bulkDeleteSteps(argsAny[0]["stepIndexes"]);
              toolCallResponse(toolCall.id, {
                status: "success",
                message: "Steps deleted successfully",
              });
              break;
            case "listSteps":
              toolCallResponse(toolCall.id, {
                // status: "success",
                steps: stepHistory.listSteps(),
              });
              break;
            default:
              await handleBasicFunctionCall();
              break;
          }
        }
      } else {
        console.log("AI chat", choice.message.content);
        process.exit(1);
      }

      await sleep(1000);
    }
  } catch (error) {
    console.error("Error in main loop", error);
    console.error(error);
  } finally {
    await engine.closeBrowser();
  }
}

main();
