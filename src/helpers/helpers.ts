import { promises as fs } from "fs";
import { join } from "path";

export async function readFileString(filePath: string): Promise<string> {
  try {
    const data = await fs.readFile(filePath, "utf-8");
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Unable to read file: ${error.message}`);
    } else {
      throw new Error(`Unable to read file: ${error}`);
    }
  }
}

export async function writeFileString(
  filePath: string,
  data: string
): Promise<void> {
  try {
    await fs.writeFile(filePath, data);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Unable to write file: ${error.message}`);
    } else {
      throw new Error(`Unable to write file: ${error}`);
    }
  }
}

export async function listFilesInDirectory(
  directoryPath: string
): Promise<string[]> {
  try {
    const files = await fs.readdir(directoryPath);
    const filePaths = files.map((file) => join(directoryPath, file));
    return filePaths;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Unable to list files: ${error.message}`);
    } else {
      throw new Error(`Unable to list files: ${error}`);
    }
  }
}

export async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
