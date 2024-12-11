import { Command } from "commander";
import path from "path";
import { convertLangchainBaseMessageToShareGPT } from "src/helpers/converter.ts";
import { createDir, fileBaseName, fileExists, readFileString, writeFileString } from "src/helpers/files.ts";
import { runGenMode } from "src/modes/gen.ts";
import { parseTestPrompt } from "src/testprompt/parser.ts";
import { addGenericOptions } from "../helpers/cli.ts";

export class GenCommand extends Command {
  constructor() {
    super("gen");

    this.description("Generate test from test prompt file");
    this.option("-f, --file <path>", "Specify test prompt file path", "");
    this.option("-translate, --translate <path>", "Translate from json file only", "");

    addGenericOptions(this as any);
  }

  public async run() {
    this.parse();

    const testPromptPath = this.opts().file;

    if (testPromptPath === "") {
      throw new Error(`No test prompt file specified (use "-f, --file" to specify)`);
    }

    const fileFound = await fileExists(testPromptPath);
    if (!fileFound) {
      throw new Error("Test prompt file not found");
    }

    const genDirOpts = this.opts().gendir;
    if (!genDirOpts) {
      throw new Error("gendir not set");
    }

    // save in directory `<DATEUNIX>_<TEST PROMPT FILE BASENAME>`
    const testPromptFileBaseName = fileBaseName(testPromptPath);
    const genDir = path.join(genDirOpts, `${String(Date.now())}_${testPromptFileBaseName}`);

    // create gen dir
    await createDir(genDir);

    console.log("Using test prompt file:", testPromptPath);

    const testPromptString = await readFileString(testPromptPath);
    const testPromptData = parseTestPrompt(testPromptString);

    let testsuiteOutputPath = testPromptData.testsuite.output;

    let genResult = await runGenMode({
      headless: this.opts().headless,
      verbose: this.opts().verbose,
      genDir: genDir,
      testPrompt: testPromptData,
    });

    // write gen data to json
    let testGenDataSavePath = path.join(genDir, `${testPromptFileBaseName}.json`);
    console.log("Testsuite gen data saved at:", testGenDataSavePath);
    await writeFileString(testGenDataSavePath, JSON.stringify(genResult.testcasesResult));

    // write generated code to output path
    await writeFileString(testsuiteOutputPath, genResult.testsuiteCode);
    console.log("Testsuite output paht:", testsuiteOutputPath);

    // convert to sharegpt
    const shareGPTData = genResult.testcasesResult.map((v) => {
      const messageBuffer = v.messageBuffer;
      const shareGPTMessages = convertLangchainBaseMessageToShareGPT(messageBuffer);
      return {
        testcase: v.testcase,
        sharegpt: shareGPTMessages,
      };
    });

    // write sharegpt to file
    let shareGPTSavePath = path.join(genDir, `${testPromptFileBaseName}.sharegpt.json`);
    console.log("Testsuite ShareGPT data saved at:", shareGPTSavePath);
    await writeFileString(shareGPTSavePath, JSON.stringify(shareGPTData));
  }
}
