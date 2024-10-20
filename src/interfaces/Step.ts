export interface IStep {
  stepId: number;
  methodName: string;
  args: string[];
  variables?: string[];
  iframeGetDataResult?: any;
}
