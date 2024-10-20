import * as prettier from "prettier";

export async function formatTSCode(code: string): Promise<string> {
  return await prettier.format(code, {
    parser: "typescript",
    semi: true,
    printWidth: 300,
  });
}
