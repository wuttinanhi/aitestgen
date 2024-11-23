export interface TestPrompt {
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
  // Java
  java_classname?: string;
}

export interface Testcases {
  testcase: Testcase[];
}

export interface Testcase {
  name: string;
  prompt: string;
}
