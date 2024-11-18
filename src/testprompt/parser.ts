import { XMLParser } from "fast-xml-parser";
import { TestPromptRoot } from "../interfaces/testprompt.ts";

export function parseTestPrompt(xmlString: string) {
  const parser = new XMLParser();
  let jObj = parser.parse(xmlString);
  return jObj as TestPromptRoot;
}
