# ai_to_testcase (aitestgen)

Generate test cases from natural language descriptions

A command-line tool that leverages AI to automatically generate test cases from natural language prompts. This tool helps developers quickly create comprehensive test suites by describing what they want to test in plain English.

## Requirements

- [Node.js](https://nodejs.org/en)

## Installation

Install Puppeteer and Chrome dependencies:

```bash
npx @puppeteer/browsers install chrome@stable
```

Install package:

```bash
yarn add -g aitestgen
```

## Usage

### Basic Command

```bash
aitestgen [options] [prompt]
```

### Options

```txt

Usage: aitestgen [options]

Generate test from prompting

Options:
  -o, --out <path>           Output path for generated test file (default: "app.test.ts")
  -gd, --gendir <path>       Directory to save generated cache (default: ".gen/")
  -p, --provider <provider>  Set model provider "openai" "ollama" (default: "openai")
  -m, --model <model>        Specify model to use (default: "gpt-4o-mini")
  -oh, --ollamahost <url>    Set Ollama endpoint (default: "http://localhost:11434")
  -t, --test                 Run test only (default: false)
  -v, --verbose              Verbose log (default: false)
  -h, --help                 display help for command

```

### Examples

Generate new tests:
```bash
aitestgen -- go to http://localhost:3000 and fill the form then expect successful message
```

Run generated tests using Vitest:
```bash
aitestgen --test
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Setup

1. Clone the repository
```bash
git clone https://github.com/wuttinanhi/ai_to_testcase
```

2. Install dependencies
```bash
yarn install
```

3. Run tests
```bash
yarn test
```

4. Link this package
```bash
yarn link
```


### Yarn scripts

| Option | Description |
|--------|-------------|
| `start` | Start the program. |
| `test` | Test the specs |
| `gentest` | Test the generated code |
| `lint` | Lint codebase |
| `translate` | Translate test steps only |


## License

MIT

## Author

wuttinanhi

## Support

If you encounter any issues or have questions, please file an issue on the GitHub repository.
