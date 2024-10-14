import { toolCallResponse } from "./tools";

async function handleStepCall() {
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

async function chooseWantedSteps(stepIndexs: number[]) {
  // console.log("chooseWantedSteps", stepIndexs);

  const steps = stepHistory.listSteps();
  for (const step of steps) {
    console.log(">>>", step.methodName, step.methodArguments);
  }

  await stepHistory.generateTestOnSelectedStep(stepIndexs);
}
