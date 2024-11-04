import { StructuredToolParams } from "@langchain/core/tools";
import z from "zod";

export const finalizeParams = z.object({
  steps: z.array(z.number()).describe("The steps ID to finalize"),
});

export type FinalizeParamsType = z.infer<typeof finalizeParams>;

export const finalizeTool: StructuredToolParams = {
  name: "finalize",
  description: "Pick the needed steps to finalize the test",
  schema: finalizeParams,
};
