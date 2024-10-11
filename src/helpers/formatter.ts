import * as prettier from "prettier";

export async function formatCode(code: string): Promise<string> {
  return await prettier.format(code, {
    parser: "typescript",
    semi: true,
  });
}
