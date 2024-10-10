export async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function argsArrayToStringParse(args: any[]): string {
  return args
    .map((arg) => {
      if (typeof arg === "string") {
        return `\`${arg}\``;
      }
      return arg.toString();
    })
    .join(", ");
}
