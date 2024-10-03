import { listFilesInDirectory, readFileString } from "./helpers";

export async function loadTools(directoryPath: string): Promise<object[]> {
  try {
    const files = await listFilesInDirectory(directoryPath);
    const jsonFiles = files.filter((file) => file.endsWith(".json"));
    const tools = await Promise.all(
      jsonFiles.map(async (file) => {
        const content = await readFileString(file);
        return JSON.parse(content);
      })
    );
    return tools;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Unable to load tools: ${error.message}`);
    } else {
      throw new Error(`Unable to load tools: ${error}`);
    }
  }
}
