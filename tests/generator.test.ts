import { BaseMessage } from "@langchain/core/messages";
import path from "path";
import { expect, test } from "vitest";
import { createDir, readFileString, writeFileString } from "../src/helpers/files.ts";
import { runVitest } from "../src/helpers/tester.ts";
import { createMessageBuffer, getOpenAIModel } from "../src/models/wrapper.ts";
import { runGenMode } from "../src/modes/gen.ts";
import { PuppeteerTranslator } from "../src/translators/puppeteer/puppeteer.translator.ts";
import { TestPrompt } from "../src/interfaces/testprompt.ts";
import { parseTestPrompt } from "../src/testprompt/parser.ts";

test("should generate working test", async () => {
  const TEST_GEN_DIR = ".test";
  const TEST_OUT_PATH = path.join(TEST_GEN_DIR, "app.test.ts");
  const TESTCASES_OUT_DATA = path.join(TEST_GEN_DIR, "testcases.json");
  const TESTPROMPT_FILE = __dirname + "/../examples/testprompts/todo.xml";

  await createDir(TEST_GEN_DIR);

  const readTestPromptString = await readFileString(TESTPROMPT_FILE);
  const testPromptData = parseTestPrompt(readTestPromptString);

  console.log("testPromptData", JSON.stringify(testPromptData));

  const genResult = await runGenMode({
    genDir: TEST_GEN_DIR,
    headless: true,
    verbose: true,
    testPrompt: testPromptData,
  });

  // write generated testcases to file
  await writeFileString(TESTCASES_OUT_DATA, JSON.stringify(genResult.testcases));

  // save generated test code to file
  await writeFileString(TEST_OUT_PATH, genResult.testsuiteCode);

  // run vitest test on generated test file
  const vitestResult = await runVitest(TEST_OUT_PATH);

  if (vitestResult.exitCode !== 0) {
    console.log("--- VITEST ERROR ---");
    console.log("vitestResult.exitCode", vitestResult.exitCode);
    console.log("START VITEST STDOUT\n", vitestResult.stdout, "\nEND VITEST STDOUT\n");
    console.log("START VITEST STDERR\n", vitestResult.stderror, "\nEND VITEST STDERR\n");
  }

  expect(vitestResult.exitCode).toBe(0);
});
