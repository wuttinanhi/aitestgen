import * as prettier from "prettier";

export async function formatTSCode(code: string): Promise<string> {
  return await prettier.format(code, {
    parser: "typescript",
    semi: true,
    printWidth: 300,
  });
}

export async function formatCodeByLanguage(lang: string, code: string) {
  switch (lang) {
    case "typescript":
      return formatTSCode(code);
    default:
      throw new Error(`formatter unknown language: ${lang}`);
  }
}
