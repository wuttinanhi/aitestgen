# ai_to_testcase (aitestgen)

Generate test cases from natural language descriptions

A command-line tool that leverages AI to automatically generate test cases from natural language prompts. This tool helps developers quickly create comprehensive test suites by describing what they want to test in plain English.

## Installation

```bash
npm install -g aitestgen
```

## Usage

### Basic Command

```bash
aitestgen [options] [prompt]
```

### Options

| Option | Alias | Description | Default |
|--------|-------|-------------|---------|
| `--out` | `-o` | Specify the output path for generated test files | app.test.ts |
| `--gendir` | `-gd` | Set the directory to save generated cache | .gen |
| `--verbose` | `-v` | Verbose logs | false|
| `--test` | `-t` | Run tests only without generating new ones |  |
| `--help` | `-h` | Display help information | |

### Examples

Generate new tests:
```bash
aitestgen -o app.test.ts go to http://localhost:3000 and fill the form then expect successful message
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
git clone https://github.com/yourusername/aitestgen.git
```

2. Install dependencies
```bash
yarn install
```

3. Run tests
```bash
yarn test
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
