import { zodFunction } from "openai/src/helpers/zod.js";
import z from "zod";

export const finalizeParams = z.object({
  steps: z.array(z.number()).describe("The steps ID to finalize"),
});

export const finalizeTool = zodFunction({
  name: "finalize",
  parameters: finalizeParams,
  description: "Pick the needed steps to finalize the test",
});

// infer the type of the function arguments
export type FinalizeParamsType = z.infer<typeof finalizeParams>;
