import { OpenAI } from "openai";
import { PuppeteerEngine } from "../engines/puppeteer";
import { TestGenUnexpectedAIResponseError } from "../errors/errors";
import { WebEngine } from "../interfaces/engine";
import { FrameData } from "../interfaces/FrameData";
import { IStep } from "../interfaces/Step";
import { ToolCallResult } from "../interfaces/ToolCallResult";
import { WebREPLToolsCollection } from "../tools/defs";
import { FinalizeParamsType, finalizeTool } from "../tools/finalizer";
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

  async generate(userPrompt: string, messageBuffer: Array<OpenAI.ChatCompletionMessageParam>) {
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

            const result = await this.handleToolCall(engine, messageBuffer, stepHistory, uniqueVariableNames, toolCall);

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
      await engine.closeBrowser({});
    }
  }

  protected appendToolResult(
    messageBuffer: any[],
    toolCall: OpenAI.Chat.Completions.ChatCompletionMessageToolCall,
    resultObject: any,
  ) {
    const toolCallResponse = {
      role: "tool",
      content: JSON.stringify(resultObject),
      tool_call_id: toolCall.id,
    } as OpenAI.ChatCompletionMessageParam;

    messageBuffer.push(toolCallResponse);

    console.log(`Return: ${JSON.stringify(resultObject).slice(0, 100)}`);
  }

  protected async handleToolCall(
    engine: WebEngine,
    messageBuffer: any[],
    stepBuffer: StepHistory,
    uniqueVariableNamesBuffer: string[],
    toolCall: OpenAI.Chat.Completions.ChatCompletionMessageToolCall,
  ): Promise<ToolCallResult> {
    const functionName = toolCall.function.name;
    const functionArgs = JSON.parse(toolCall.function.arguments);

    // const functionArguments = JSON.parse(toolCall.function.arguments);
    // const functionArgsValue = Object.values(functionArguments);
    // const argsAny = functionArgsValue as any;
    // const variables = functionArguments["varName"];

    console.log(`Invoking tool name: ${functionName}`);
    console.log(`Invoking tool args: ${functionArgs}`);

    // if (variables) {
    //   console.log(`Variable: ${variables}`);
    // }

    try {
      // loop each variable name and check if it has been declared before
      for (const varName of uniqueVariableNamesBuffer) {
        if (uniqueVariableNamesBuffer.includes(varName)) {
          throw new Error(`Variable ${varName} already declared. please use a different variable name`);
        } else {
          uniqueVariableNamesBuffer.push(varName);
        }
      }

      // if function name is complete, then break the loop
      if (functionName === "complete") {
        // if the last step is not closeBrowser, add it
        if (stepBuffer.latestStep().methodName !== "closeBrowser") {
          const closeBrowserStep: IStep = {
            stepId: 0,
            methodName: "closeBrowser",
            functionArgs: {},
          };
          stepBuffer.createStep(closeBrowserStep);
        }

        this.appendToolResult(messageBuffer, toolCall, {
          status: "success",
          message: "Backend acknowledged completion",
        });

        return { completed: true };
      }

      // if function name is reset, then reset the engine
      if (functionName === "reset") {
        await engine.reset({});
        stepBuffer.reset();
        uniqueVariableNamesBuffer.length = 0; // clear the unique variable names

        this.appendToolResult(messageBuffer, toolCall, {
          status: "success",
          message: "Reset browser successfully",
        });

        return { completed: false };
      }

      // Basic function invocation
      // Invoke the function with the extracted arguments
      // prettier-ignore
      // let result = await (engine as any)[functionName](...functionArgsValue);
      let result = await (engine as any)[functionName](functionArgs);

      if (result === undefined || result === null) {
        result = { status: "success" };
      }

      // add the step to the step buffer
      const step: IStep = {
        stepId: 0,
        methodName: functionName,
        functionArgs: functionArgs,
      };

      // if step have variables, add them to the step
      // if (functionArguments["varName"]) {
      //   step.variables = [functionArguments["varName"]];
      // }

      // if command is "iframeGetData" then add the returned data to the step
      if (functionName === "iframeGetData") {
        // remove _internalPage in each frame data
        result.forEach((frameData: FrameData) => {
          delete frameData._internalPage;
        });

        step.iframeGetDataResult = result;
      }

      // if function name contains "expect" the result should always be true to add to the step buffer
      // prettier-ignore
      const shouldAddStep = functionName.includes("expect") ? (result["evaluate_result"] === true) : true;
      if (shouldAddStep) {
        stepBuffer.createStep(step);
      }

      // if result contains pageChanged key then add waitForPageLoad step
      if (result.pageChanged) {
        const waitForPageLoadStep: IStep = {
          stepId: 0,
          methodName: "waitForPageLoad",
          functionArgs: {},
        };
        stepBuffer.createStep(waitForPageLoadStep);
      }

      // push the result back to the messages buffer
      this.appendToolResult(messageBuffer, toolCall, result);

      return { completed: false };
    } catch (err) {
      const error = err as Error;

      const errorObj = {
        status: "error",
        message: error.message,
      };

      // push the error back to the messages
      this.appendToolResult(messageBuffer, toolCall, errorObj);

      console.error("Error in invoking function:", errorObj);

      return { completed: false };
    }
  }

  protected async handleFinalize(
    SYSTEM_FINALIZE_PROMPT: string,
    llm: OpenAI,
    messageBuffer: Array<OpenAI.ChatCompletionMessageParam>,
    stepBuffer: StepHistory,
  ) {
    messageBuffer.push({
      role: "system",
      content: SYSTEM_FINALIZE_PROMPT,
    });

    const stepJSON = JSON.stringify(stepBuffer.getAll());

    messageBuffer.push({
      role: "assistant",
      content: stepJSON,
    });

    const response = await llm.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messageBuffer,
      tools: [finalizeTool],
      max_tokens: 500,
      temperature: 0.0,
    });

    const choice = response.choices[0];
    messageBuffer.push(choice.message);

    if (!choice.message.tool_calls) {
      throw new Error("No tool calls found in response");
    }

    const toolCall = choice.message.tool_calls[0];

    const functionName = toolCall.function.name;
    const functionArguments: FinalizeParamsType = JSON.parse(toolCall.function.arguments);

    const selectedSteps = functionArguments.steps;

    console.log(`Invoking tools: ${functionName}`);

    this.appendToolResult(messageBuffer, toolCall, {
      status: "success",
    });

    return {
      selectedSteps,
      totalTokens: response.usage ? response.usage.total_tokens : 0,
    };
  }
}
