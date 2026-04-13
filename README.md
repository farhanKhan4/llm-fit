# llm-fit

`llm-fit` is a production-ready, open-source CLI that scans your hardware and recommends local LLMs and coding-focused models that fit your machine.

It supports Windows first, and also works on macOS and Linux.

## Features

- Hardware scan (RAM, CPU, GPU, VRAM, OS, WSL detection)
- Tiered recommendations: Recommended, Might Work, Not Recommended
- Curated model catalog with category filters
- Optional model installs through Ollama
- Sync of trending GGUF models from Hugging Face
- ESM-only Node.js codebase for modern ecosystem compatibility

## Requirements

- Node.js 18+
- npm
- Ollama (optional, only needed for `install` command)

## Installation

### From source

```bash
git clone https://github.com/your-username/llm-fit
cd llm-fit
npm install
```

### Link globally for development

```bash
npm link
```

### Use it

```bash
llm-fit scan
llm-fit recommend
llm-fit recommend --category coding
llm-fit models
llm-fit models --category general
llm-fit models --json
llm-fit install llama3.2:3b
llm-fit update-models
```

## Commands

### `llm-fit scan`

Scans your local machine and prints a hardware summary.

### `llm-fit recommend [--category coding|general|all]`

Scans your machine and returns three recommendation tiers.

- `--category coding` shows coding models only
- `--category general` shows general-purpose models only
- `--category all` (default) shows all curated models

### `llm-fit models [--category coding|general|all] [--json]`

Lists curated models in a table format or raw JSON.

### `llm-fit install <modelName>`

Installs a model via Ollama.

- Accepts either local `name` or `ollama_tag`
- If a model is unknown to local DB, install is still attempted

### `llm-fit update-models`

Fetches trending GGUF models from Hugging Face and appends only new entries without overwriting curated records.

## Output Design

- Cyan section headers for scan/results sections
- Green/Yellow/Red tiers for recommendation status
- 80-column-friendly table and boxed output

## Project Structure

```text
llm-fit/
├── index.js
├── commands/
│   ├── scan.js
│   ├── recommend.js
│   ├── models.js
│   ├── install.js
│   └── update-models.js
├── services/
│   ├── systemScanner.js
│   ├── recommender.js
│   └── huggingface.js
├── data/
│   └── models.json
├── utils/
│   └── formatter.js
├── package.json
└── README.md
```

## Extensibility Notes

- `services/recommender.js` is intentionally stateless so the scoring function can be replaced by an AI-driven ranking service later.
- `data/models.json` is schema-version-ready by design; a top-level migration strategy can be introduced in a future release.
- `services/huggingface.js` uses only Node built-ins (`https`) so retry, caching, and offline fallback strategies can be added without external HTTP libraries.

## Development

Run directly without global linking:

```bash
node index.js --help
node index.js scan
node index.js recommend --category coding
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes with clear commit messages
4. Open a pull request with before/after command output samples

## License

MIT
