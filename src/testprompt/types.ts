export interface TestPromptRoot {
  testsuite: Testsuite;
}

export interface Testsuite {
  name: string;
  output: string;
  language: string;
  translator: string;
  provider: string;
  model: string;
  testcases: Testcases;
}

export interface Testcases {
  testcase: Testcase[];
}

export interface Testcase {
  name: string;
  prompt: string;
}
