import * as prettier from "prettier";
// import * as prettierPluginJava from "prettier-plugin-java";

export async function formatTypescriptCode(code: string): Promise<string> {
  return await prettier.format(code, {
    parser: "typescript",
    semi: true,
    printWidth: 300,
  });
}

export async function formatJSONCode(code: string): Promise<string> {
  return await prettier.format(code, {
    parser: "jsonc",
    trailingComma: "none",
    semi: false,
  });
}

export async function formatCodeByLanguage(lang: string, code: string) {
  switch (lang) {
    case "typescript":
      return formatTypescriptCode(code);
    default:
      throw new Error(`formatter unknown language: ${lang}`);
  }
}
