// import { dirname } from "path";
// import { fileURLToPath } from "url";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// console.log(">>> __dirname", __dirname);

import { readFileSync } from "node:fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

export const DEFAULT_SYSTEM_INSTRUCTION_PROMPT = readFileSync(`${__dirname}/system_instruction_prompt.txt`, 'utf-8');

export const DEFAULT_SYSTEM_FINALIZE_PROMPT = readFileSync(`${__dirname}/system_finalize_prompt.txt`,  'utf-8');
