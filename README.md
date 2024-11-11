# ai_to_testcase (aitestgen)

A command-line tool that leverages AI to automatically generate test cases from natural language prompts. This tool helps developers quickly create comprehensive test suites by describing what they want to test in plain English.

## Features

- Generate test cases from natural language descriptions

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

| Option | Alias | Description |
|--------|-------|-------------|
| `--out` | `-o` | Specify the output path for generated test files |
| `--gendir` | `-gd` | Set the directory to save generated cache |
| `--test` | `-t` | Run tests only without generating new ones (default: false) |
| `--help` | `-h` | Display help information |

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
npm install
```

3. Run tests
```bash
npm test
```

## License

MIT

## Author

wuttinanhi

## Support

If you encounter any issues or have questions, please file an issue on the GitHub repository.
