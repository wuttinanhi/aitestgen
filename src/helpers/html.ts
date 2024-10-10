export function HTMLStripNonDisplayTags(htmlString: string) {
  // Define a list of tags that don't affect web display
  const nonDisplayTags = [
    "script",
    "meta",
    "link",
    "style",
    "noscript",
    "base",
    "template",
  ];

  // Use regular expressions to remove these tags and their contents if necessary
  nonDisplayTags.forEach((tag) => {
    const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "gi"); // For tags with content
    htmlString = htmlString.replace(regex, ""); // Strip the tag with its content

    const selfClosingRegex = new RegExp(`<${tag}[^>]*\\/?>`, "gi"); // For self-closing tags like <meta>, <link>
    htmlString = htmlString.replace(selfClosingRegex, ""); // Strip self-closing tags
  });

  return htmlString;
}
