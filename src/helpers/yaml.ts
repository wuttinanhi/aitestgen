import YAML from "yaml";

export async function JSONtoYAML(jObj: any) {
  return YAML.stringify(jObj);
}
