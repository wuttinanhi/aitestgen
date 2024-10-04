import fs from "fs";
import OpenAI, { BadRequestError } from "openai";
import { zodResponseFormat } from "openai/helpers/zod.mjs";
import z from "zod";

async function main() {
  // const toolsDefinition = (await loadTools(
  //   "./tools"
  // )) as Array<OpenAI.ChatCompletionTool>;
  // for (const tool of toolsDefinition) {
  //   console.log(tool);
  // }

  // const systemInstruction = await readFileString("prompts/instruction.txt");

  // const EXAMPLE_1 = await readFileString("prompts/example1.txt");

  // const LOOP_HARD_LIMIT = 30;

  const extractOutputSchema = z.object({
    selector: z.string(),
    xpath: z.string(),
    full_xpath: z.string(),
  });

  const openai = new OpenAI();

  // const engine = new PuppeteerWebTest();

  const messages: Array<OpenAI.ChatCompletionMessageParam> = [];

  // messages.push({
  //   role: "system",
  //   content: systemInstruction,
  // });
  // messages.push({
  //   role: "user",
  //   content: EXAMPLE_1,
  // });

  // const response = await openai.chat.completions.create({
  //   model: "gpt-4o-mini",
  //   messages: messages,
  //   tools: toolsDefinition,
  // });

  // const choice = response.choices[0];

  // messages.push(choice.message);
  // console.log(choice.message);

  // const threadsMessage: OpenAI.Beta.Threads.ThreadCreateParams.Message[] = [];

  const assistant = await openai.beta.assistants.create({
    name: "AI web page selector extractor",
    instructions: "You are a AI tool to extract selectors from html code.",
    tools: [{ type: "file_search" }],
    model: "gpt-4o-mini",
  });

  const tempThread = await openai.beta.threads.create();

  const uploadedFileData = await openai.files.create({
    // file: fs.createReadStream("raws/test.html"),
    file: fs.createReadStream("raws/stripe_checkout_page.html"),
    purpose: "assistants",
  });

  console.log(`file id: ${uploadedFileData.id}`);

  try {
    // messages.push({
    //   role: "system",
    //   content: "You are a AI tool to extract selectors from a webpage",
    // });

    // const message_1 = await openai.beta.threads.messages.create(tempThread.id, {
    //   role: "assistant",
    //   content: "You are a AI tool to extract selectors from a webpage",
    // });

    const fileMessage = await openai.beta.threads.messages.create(
      tempThread.id,
      {
        role: "user",
        attachments: [
          {
            file_id: uploadedFileData.id,
            tools: [{ type: "file_search" }],
          },
        ],
        content: `stripe blue pay button`,
      }
    );
    console.log(fileMessage);

    // const message_3 = await openai.beta.threads.messages.create(tempThread.id, {
    //   role: "assistant",
    //   content: "Please extract the selector from user request",
    //   metadata: {},
    // });

    let run = await openai.beta.threads.runs.createAndPoll(tempThread.id, {
      assistant_id: assistant.id,
      instructions:
        "Extract element CSS selector, XPath, and full XPath from the HTML file.",
      model: "gpt-4o-mini",
      tools: [
        {
          type: "file_search",
          file_search: {
            max_num_results: 1,
          },
        },
      ],
      // response_format: zodResponseFormat(
      //   extractOutputSchema,
      //   "extractOutputSchema"
      // ),
    });

    let lastmessage;

    if (run.status === "completed") {
      const messages = await openai.beta.threads.messages.list(run.thread_id);

      for (const message of messages.data.reverse()) {
        // console.log(`role: ${message.role}`);
        // console.log(message);

        const textValue = (message.content[0] as any)["text"]["value"];
        // console.log("textvalue:", textValue);

        console.log(`${message.role} > ${textValue}\n\n`);

        lastmessage = textValue;
      }
    } else {
      console.log(run.status);
      process.exit(1);
    }

    // Parse response to JSON
    const jsonResponse = await openai.chat.completions.create({
      model: "gpt-4o-2024-08-06",
      messages: [
        {
          role: "system",
          content: `format this message into JSON: ${lastmessage}`,
        },
      ],
      response_format: zodResponseFormat(
        extractOutputSchema,
        "extractOutputSchema"
      ),
    });

    // console.log("before:", lastmessage);
    // console.log(jsonResponse.choices[0].message);

    console.log("\n\n\njson output:");
    console.log(JSON.parse(jsonResponse.choices[0].message.content!));

    // const Step = z.object({
    //   explanation: z.string(),
    //   output: z.string(),
    // });

    // const MathReasoning = z.object({
    //   steps: z.array(Step),
    //   final_answer: z.string(),
    // });

    // messages.push({
    //   role: "user",
    //   content: `please extract the selector of message input from file id: ${uploadedFileData.id}`,
    // });

    // messages.push({
    //   role: "user",
    //   content: `did you see the file I upload? file id: ${uploadedFileData.id} please response what you see`,
    // });

    // const response = await openai.chat.completions.create({
    //   model: "gpt-4o-mini",
    //   messages: messages,
    //   // response_format: zodResponseFormat(
    //   //   extractOutputSchema,
    //   //   "extractOutputSchema"
    //   // ),
    // });

    // const choice = response.choices[0];

    // push the message to the messages
    // messages.push(choice.message);

    // console.log("choice.message", choice.message);

    // console.log(JSON.parse(choice.message.content!));

    // loop_hard_limit: for (let i = 0; i < LOOP_HARD_LIMIT; i++) {
    //   const response = await openai.chat.completions.create({
    //     model: "gpt-4o-mini",
    //     messages: messages,
    //     tools: toolsDefinition,
    //   });

    //   console.log(`\n\nLoop: ${i}`);

    //   const choice = response.choices[0];

    //   // console.log("choice", choice.message);

    //   // push the message to the messages
    //   messages.push(choice.message);

    //   // if it is function call, execute it
    //   if (choice.message.tool_calls && choice.message.tool_calls.length > 0) {
    //     // loop through the tool calls and execute them
    //     for (const toolCall of choice.message.tool_calls) {
    //       const functionName = toolCall.function.name;
    //       const functionArguments = JSON.parse(toolCall.function.arguments);

    //       console.log(`Function call: ${functionName}`);
    //       // console.log(`Function arguments: ${functionArguments}`);

    //       try {
    //         // Extract values from the functionArguments object
    //         const args = Object.values(functionArguments);
    //         console.log("Args", args);

    //         // Invoke the function with the extracted arguments
    //         const result = await (engine as any)[functionName](...args);

    //         // push the result to the messages
    //         messages.push({
    //           role: "tool",
    //           content: JSON.stringify(
    //             result === undefined || result === null
    //               ? "no return value from function"
    //               : result
    //           ),
    //           tool_call_id: toolCall.id,
    //         });

    //         // log the result
    //         if (typeof result === "string" && result.length > 100) {
    //           console.log("Result", result.slice(0, 100));
    //         } else {
    //           console.log("Result", result);
    //         }
    //       } catch (e) {
    //         const error = e as Error;

    //         console.error("error in invoking function", error);

    //         // push the error back to the messages
    //         messages.push({
    //           role: "tool",
    //           content: error.message,
    //           tool_call_id: toolCall.id,
    //         });
    //       }

    //       // if function name is complete, then break the loop
    //       if (functionName === "complete") {
    //         break loop_hard_limit;
    //       }
    //     }
    //   } else {
    //     console.log(choice.message.content);
    //   }

    //   // await sleep(1000);
    // }
  } catch (error) {
    if (error instanceof BadRequestError) {
      console.error(error.message);
      // dump the messages
      console.log(messages);
    } else if (error instanceof Error) {
      console.error(error);
      console.error(error.stack);
    } else {
      console.error(error);
    }
  } finally {
    // await engine.closeBrowser();
    // await openai.files.del(uploadedFileData.id);
    // await openai.beta.threads.del(tempThread.id);
    // await openai.beta.assistants.del(assistant.id);
  }
}

main();

// async function stripTest() {
//   let htmlPage = await readFileString("raws/stripe_checkout_page.html");
//   const beforeLength = htmlPage.length;
//   let strippedHtmlPage = stripWrapper(htmlPage);
//   const afterLength = strippedHtmlPage.length;

//   console.log(
//     `Before: ${beforeLength} After: ${afterLength} Diff: ${
//       beforeLength - afterLength
//     }`
//   );

//   await writeFileString(
//     "raws/stripe_checkout_page_stripped.html",
//     strippedHtmlPage
//   );
// }

// stripTest();
