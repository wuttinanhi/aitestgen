# aitestgen

Generate test suites from natural language descriptions.

A command-line tool that leverages AI to generate test cases from natural language prompts automatically. 
This tool helps developers quickly create comprehensive test suites by describing what they want to test in plain English.

## Features
- Generate Puppeteer tests
- Generate Selenium tests

## Requirements

- [Node.js](https://nodejs.org/en)

## Installation

```bash
yarn add -g aitestgen
```

## Quickstart

Set OpenAI key

```bash
export OPENAI_API_KEY="<YOUR_KEY_HERE>"
```

Generate testsuite from test prompt file ([todo.xml](examples/testprompts/todo.xml))

```bash
aitestgen gen -f examples/testprompts/todo.xml
```

The generated output will be saved at [examples/testprompts/todo.test.ts](examples/testprompts/todo.test.ts)

Please see more test prompt examples at [examples/testprompts](examples/testprompts)

## Choosing a Model

Currently, the best-performing model for test generation is **gpt-4o-mini**.  
We are still searching for the ideal Ollama model for a self-hosted solution.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Setup

1. Clone the repository
```bash
git clone https://github.com/wuttinanhi/aitestgen
```

2. Install dependencies
```bash
yarn install
```

3. Run project tests
```bash
yarn test
```

4. Link this package to use locally
```bash
yarn link
```


### Yarn scripts

| Option | Description |
|--------|-------------|
| `start` | Start the program. |
| `test` | Run project tests |
| `lint` | Lint codebase |


## License

MIT

## Author

wuttinanhi

## Support

If you encounter any issues or have questions, please file an issue on the GitHub repository.
