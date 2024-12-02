import { XMLBuilder } from "fast-xml-parser";

export async function JSONtoXML(jObj: any): Promise<string> {
  const builder = new XMLBuilder();
  const xmlContent = builder.build(jObj);
  return xmlContent;
}
