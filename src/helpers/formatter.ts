import * as prettier from "prettier";
// import * as prettierPluginJava from "prettier-plugin-java";

export async function formatTypescriptCode(code: string): Promise<string> {
  return await prettier.format(code, {
    parser: "typescript",
    semi: true,
    printWidth: 300,
  });
}

export async function formatJavaCode(code: string): Promise<string> {
  return await prettier.format(code, {
    parser: "java",
    plugins: ["prettier-plugin-java"],
    // plugins: [prettierPluginJava],
    // semi: true,
    printWidth: 300,
  });
}
