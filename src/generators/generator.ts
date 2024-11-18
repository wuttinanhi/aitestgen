import { AIMessage, BaseMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import { ToolCall, ToolMessage } from "@langchain/core/messages/tool";
import { FrameData } from "../interfaces/framedata.ts";
import { IStep } from "../interfaces/step.ts";
import { AIModel } from "../models/types.ts";
import { WebREPLToolsCollection } from "../tools/defs.ts";
import { FinalizeParamsType, finalizeTool } from "../tools/finalizer.ts";
import { StepHistory } from "../stephistory/stephistory.ts";
import { WebControllerProxy } from "../proxy/webcontroller_proxy.ts";
import { WebController } from "../interfaces/controller.ts";

export class TestStepGenerator {
  private llm: AIModel;
  private webController!: WebController;
  private systemInstructionPrompt: string;
  private systemFinalizePrompt: string;
  private loopHardLimit: number = 30;
  private verbose: boolean = false;

  private generatedSteps: IStep[] = [];
  private finalizedSteps: IStep[] = [];
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
    const stepHistory = new StepHistory();
    let uniqueVariableNames: string[] = [];

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

            const result = await this.handleToolCall(this.webController, messageBuffer, stepHistory, uniqueVariableNames, toolCall);

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

      // store all generated steps
      this.generatedSteps = stepHistory.getAll();

      const finalizedStep = await this.handleFinalize(this.systemFinalizePrompt, messageBuffer, stepHistory);

      // store all finalized steps
      this.finalizedSteps = finalizedStep;

      return finalizedStep;
    } catch (error) {
      console.error("Error TestStepGenerator", error);
      throw error;
    } finally {
      await this.webController.closeBrowser({});
    }
  }

  protected appendToolResult(messageBuffer: Array<BaseMessage>, toolCall: ToolCall, resultObject: any) {
    const toolCallResponse = new ToolMessage({
      content: JSON.stringify(resultObject),
      tool_call_id: toolCall.id!,
    });
    // toolCallResponse.tool_call_id = toolCall.id!;

    messageBuffer.push(toolCallResponse);
  }

  protected async handleToolCall(
    controller: WebController,
    messageBuffer: any[],
    stepBuffer: StepHistory,
    uniqueVariableNamesBuffer: string[],
    toolCall: ToolCall,
  ) {
    const functionName = toolCall.name;
    const functionArgs = toolCall.args;

    try {
      // check variable name duplication
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

        // append the tool call response
        this.appendToolResult(messageBuffer, toolCall, {
          status: "success",
          message: "Backend acknowledged completion",
        });

        return;
      }

      // if function name is reset, then reset the controller
      if (functionName === "reset") {
        await controller.reset({});
        stepBuffer.reset();
        uniqueVariableNamesBuffer.length = 0; // clear the unique variable names

        this.appendToolResult(messageBuffer, toolCall, {
          status: "success",
          message: "Reset browser successfully",
        });

        return;
      }

      // invoke controller function
      let result = await WebControllerProxy.callFunction(controller, functionName, functionArgs);

      // if result is undefined or null, then set it to success
      if (result === undefined || result === null) {
        result = { status: "success" };
      }

      // create new step
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

      // if function name contains "expect". the result should always be true to add to the step buffer
      const shouldAddStep = functionName.includes("expect") ? result["evaluate_result"] === true : true;
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

      return result;
    } catch (err) {
      const error = err as Error;

      const errorObj = {
        status: "error",
        message: error.message,
      };

      // push the error back to the messages
      this.appendToolResult(messageBuffer, toolCall, errorObj);

      this.log(`\tError in invoking function: ${JSON.stringify(errorObj)}`);

      return;
    }
  }

  protected async handleFinalize(SYSTEM_FINALIZE_PROMPT: string, messageBuffer: Array<BaseMessage>, stepHistory: StepHistory) {
    // send finalize instruction to llm
    messageBuffer.push(new SystemMessage({ content: SYSTEM_FINALIZE_PROMPT }));

    // loop 5 time before throw error
    for (let i = 0; i < 5; i++) {
      // send all step to llm
      const stepJSON = JSON.stringify(stepHistory.getAll());
      messageBuffer.push(new AIMessage({ content: stepJSON }));

      // BIND TOOLS finalizer
      const llmWithFinalizeTool = this.llm.bindTools([finalizeTool]);

      const response = await llmWithFinalizeTool.invoke(messageBuffer);

      messageBuffer.push(response);
      this.totalTokensUsed += response.usage_metadata!.total_tokens;

      if (!response.tool_calls) {
        console.warn("LLM response with no tool calls found in finalize step", response.content);

        // response with no tool calls, continue to next loop
        messageBuffer.push(new SystemMessage({ content: "Error! No tool calls found. Please use tool calls `finalize` now!" }));

        continue;
      }

      const toolCall = response.tool_calls[0];

      const functionName = toolCall.name;
      const functionArguments: FinalizeParamsType = toolCall.args as any;

      const selectedStepIDs = functionArguments.steps;

      this.log(`FINALIZING (tool: ${functionName})`);

      // send complete message to llm
      this.appendToolResult(messageBuffer, toolCall, { status: "success" });

      // pick best steps
      const selectedSteps = stepHistory.pickStepByIds(selectedStepIDs);

      return selectedSteps;
    }

    throw new Error("Error in finalizing: AI did not respond with finalize steps");
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
    if (!this.verbose) {
      return;
    }

    console.log(text);
  }
}
