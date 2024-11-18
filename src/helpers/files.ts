import { promises as fs, existsSync } from "fs";
import path from "path";

export async function readFileString(filePath: string): Promise<string> {
  const data = await fs.readFile(filePath, "utf-8");
  return data;
}

export async function writeFileString(filePath: string, data: string): Promise<void> {
  await fs.writeFile(filePath, data);
}

export async function listFilesInDirectory(directoryPath: string): Promise<string[]> {
  try {
    const files = await fs.readdir(directoryPath);
    const filePaths = files.map((file) => path.join(directoryPath, file));
    return filePaths;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Unable to list files: ${error.message}`);
    } else {
      throw new Error(`Unable to list files: ${error}`);
    }
  }
}

export async function createDirIgnoreFile(filePath: string) {
  const dir = path.dirname(filePath); // Get the directory part from the file path
  await fs.mkdir(dir, { recursive: true }); // Create the directory structure
}

export async function createDir(dirPath: string) {
  await fs.mkdir(dirPath, { recursive: true });
}

export async function fileExists(filePath: string) {
  return existsSync(filePath);
}
