import YAML from "yaml";

export async function ObjtoYAML(jObj: any) {
  return YAML.stringify(jObj);
}
