import { AIMessage, BaseMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import { ToolCall, ToolMessage } from "@langchain/core/messages/tool";
import { WebController } from "../interfaces/controller.ts";
import { FrameData } from "../interfaces/framedata.ts";
import { Step } from "../interfaces/step.ts";
import { AIModel } from "../models/types.ts";
import { WebControllerProxy } from "../proxy/webcontroller_proxy.ts";
import { StepHistory } from "../stephistory/stephistory.ts";
import { WebREPLToolsCollection } from "../tools/defs.ts";
import { FinalizeParamsType, finalizeTool } from "../tools/finalizer.ts";

export class TestStepGenerator {
  private llm: AIModel;
  private webController!: WebController;
  private systemInstructionPrompt: string;
  private systemFinalizePrompt: string;
  private loopHardLimit: number = 30;
  private verbose: boolean = false;

  private generatedSteps: Step[] = [];
  private finalizedSteps: Step[] = [];
  private totalTokensUsed: number = 0;

  constructor(llm: AIModel, webController: WebController, systemInstructionPrompt: string, systemFinalizePrompt: string) {
    this.llm = llm;
    this.systemInstructionPrompt = systemInstructionPrompt;
    this.systemFinalizePrompt = systemFinalizePrompt;
    this.webController = webController;
  }

  setHardLoopLimit(hardLoopLimit: number) {
    this.loopHardLimit = hardLoopLimit;
  }

  setVerbose(verbose: boolean) {
    this.verbose = verbose;
  }

  async generate(userPrompt: string, messageBuffer: Array<BaseMessage>) {
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

    const stepHistory = await this.internalGenerate(messageBuffer);

    // store all generated steps
    this.generatedSteps = stepHistory.getAll();

    const finalizedStep = await this.handleFinalize(this.systemFinalizePrompt, messageBuffer, stepHistory);

    // store all finalized steps
    this.finalizedSteps = finalizedStep;

    return this.finalizedSteps;
  }

  private async internalGenerate(messageBuffer: Array<BaseMessage>) {
    const stepHistory = new StepHistory();
    let uniqueVariableNames: string[] = [];

    try {
      const aiWithTools = this.llm.bindTools(WebREPLToolsCollection);

      // auto open browser
      await this.webController.launchBrowser({});

      loop_hard_limit: for (let i = 0; i < this.loopHardLimit; i++) {
        const response = await aiWithTools.invoke(messageBuffer);

        this.log(`LOOP: ${i + 1}`);

        messageBuffer.push(response);
        this.totalTokensUsed += response.usage_metadata!.total_tokens;

        // if it is function call, execute it
        if (response.tool_calls && response.tool_calls.length > 0) {
          for (const toolCall of response.tool_calls) {
            const functionName = toolCall.name;
            const functionArguments = toolCall.args;

            this.log(`\tInvoking tool name: ${functionName}`);
            this.log(`\tInvoking tool args: ${JSON.stringify(functionArguments)}`);

            const result = await this.handleToolCall(this.webController, messageBuffer, stepHistory, toolCall);

            this.log(`\tInvoking result: ${JSON.stringify(result)}`);

            if (functionName === "complete") {
              break loop_hard_limit;
            }
          }
        } else {
          console.warn("LLM response with no tool calls found in generate step", response.content);

          messageBuffer.push(new SystemMessage({ content: "Error! No tool calls found. Please use tool calls now!" }));

          continue;
        }
      }

      return stepHistory;
    } catch (error) {
      console.error("Error in generation", error);
      throw error;
    } finally {
      // force close browser
      await this.webController.closeBrowser({});
    }
  }

  protected async handleToolCall(controller: WebController, messageBuffer: any[], stepHistory: StepHistory, toolCall: ToolCall) {
    const functionName = toolCall.name;
    const functionArgs = toolCall.args;

    try {
      // if function name is complete, then break the loop
      if (functionName === "complete") {
        // if the last step is not closeBrowser, add it
        if (stepHistory.latestStep().methodName !== "closeBrowser") {
          const closeBrowserStep: Step = {
            stepId: 0,
            methodName: "closeBrowser",
            functionArgs: {},
          };
          stepHistory.createStep(closeBrowserStep);
        }

        const response = {
          status: "success",
          message: "Backend acknowledged completion",
        };

        // append the tool call response
        this.appendToolResult(messageBuffer, toolCall, response);

        return response;
      }

      // if function name is reset, then reset the controller
      if (functionName === "reset") {
        // reset browser
        await controller.reset({});

        // reset step history
        stepHistory.reset();

        const response = {
          status: "success",
          message: "Reset browser successfully. you can start create test from beginning again",
        };

        this.appendToolResult(messageBuffer, toolCall, response);

        return response;
      }

      // invoke controller function
      let result = await WebControllerProxy.callFunction(controller, functionName, functionArgs);

      // if result is undefined or null, then set it to success
      if (result === undefined || result === null) {
        result = { status: "success" };
      }

      // create new step
      const step: Step = {
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

      // if function name contains "expect". the result should always be true to add to the step buffer
      const shouldAddStep = functionName.includes("expect") ? result["evaluate_result"] === true : true;
      if (shouldAddStep) {
        stepHistory.createStep(step);
      }

      // if result contains pageChanged key then add waitForPageLoad step
      if (result.pageChanged) {
        const waitForPageLoadStep: Step = {
          stepId: 0,
          methodName: "waitForPageLoad",
          functionArgs: {},
        };
        stepHistory.createStep(waitForPageLoadStep);
      }

      // push the result back to the messages buffer
      this.appendToolResult(messageBuffer, toolCall, result);

      return result;
    } catch (err) {
      const error = err as Error;

      const errorObj = {
        status: "error",
        message: error.message,
      };

      // push the error back to the messages
      this.appendToolResult(messageBuffer, toolCall, errorObj);

      this.log(`\t\t!!! Error in invoking function: ${JSON.stringify(errorObj)}`);

      return errorObj;
    }
  }

  protected async handleFinalize(SYSTEM_FINALIZE_PROMPT: string, messageBuffer: Array<BaseMessage>, stepHistory: StepHistory) {
    // send finalize instruction to llm
    messageBuffer.push(new SystemMessage({ content: SYSTEM_FINALIZE_PROMPT }));

    // send all step to llm
    const allSteps = stepHistory.getAll();
    const stepJSON = JSON.stringify(allSteps);
    messageBuffer.push(new AIMessage({ content: stepJSON }));

    this.log(`Finalizing (total steps : ${allSteps.length})`);
    for (const step of allSteps) {
      this.log("\t" + JSON.stringify(step));
    }
    this.log(`\t`);

    // loop before throw error
    for (let i = 0; i < 10; i++) {
      // BIND TOOLS finalizer
      const llmWithFinalizeTool = this.llm.bindTools([finalizeTool]);

      const response = await llmWithFinalizeTool.invoke(messageBuffer, {
        // Tool choice is not supported for ChatOllama.
        // tool_choice: "finalize",
      });

      messageBuffer.push(response);
      this.totalTokensUsed += response.usage_metadata!.total_tokens;

      if (!response.tool_calls || response.tool_calls.length === 0) {
        console.warn("LLM response with no tool calls found in finalize step", response.content);

        // response with no tool calls, continue to next loop
        messageBuffer.push(new SystemMessage({ content: `Error! No tool calls found. Please use tool "finalize" now!` }));
        continue;
      }

      const toolCall = response.tool_calls[0];
      const functionName = toolCall.name;
      const functionArguments: FinalizeParamsType = toolCall.args as any;
      const selectedStepIDs = functionArguments.steps;

      // pick best steps
      const selectedSteps = stepHistory.pickStepByIds(selectedStepIDs);

      this.log(`FINALIZING (tool: ${functionName})`);
      this.log(`SELECTED STEPS: ${JSON.stringify(selectedStepIDs)}`);

      // send complete message to llm
      this.appendToolResult(messageBuffer, toolCall, { status: "success" });

      return selectedSteps;
    }

    throw new Error("Error in finalizing: AI did not respond with finalize steps");
  }

  protected appendToolResult(messageBuffer: Array<BaseMessage>, toolCall: ToolCall, resultObject: any) {
    const toolCallResponse = new ToolMessage({
      content: JSON.stringify(resultObject),
      tool_call_id: toolCall.id!,
    });

    messageBuffer.push(toolCallResponse);
  }

  public getGeneratedSteps() {
    return this.generatedSteps;
  }

  public getFinalizedSteps() {
    return this.finalizedSteps;
  }

  public getTotalTokens() {
    return this.totalTokensUsed;
  }

  protected log(text: string) {
    if (this.verbose) {
      console.log(text);
    }
  }
}
