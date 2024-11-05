import { readFileString } from "../src/helpers/files";

export const DEFAULT_SYSTEM_INSTRUCTION_PROMPT = async () =>
  readFileString(`${__dirname}/system_instruction_prompt.txt`);
export const DEFAULT_SYSTEM_FINALIZE_PROMPT = async () => readFileString(`${__dirname}/system_finalize_prompt.txt`);
