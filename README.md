```
 ___       ___       _____ ______                  ________ ___  _________
|\  \     |\  \     |\   _ \  _   \               |\  _____\\  \|\___   ___|
\ \  \    \ \  \    \ \  \\\__\ \  \  ____________\ \  \__/\ \  \|___ \  \_|
 \ \  \    \ \  \    \ \  \\|__| \  \|\____________\ \   __\\ \  \   \ \  \
  \ \  \____\ \  \____\ \  \    \ \  \|____________|\ \  \_| \ \  \   \ \  \
   \ \_______\ \_______\ \__\    \ \__\              \ \__\   \ \__\   \ \__\
    \|_______|\|_______|\|__|     \|__|               \|__|    \|__|    \|__|
```

# llm-fit

> Scan your hardware. Get instant local LLM recommendations that actually fit your machine.

[![npm version](https://img.shields.io/npm/v/llm-fit)](https://www.npmjs.com/package/llm-fit)
[![npm downloads](https://img.shields.io/npm/dm/llm-fit)](https://www.npmjs.com/package/llm-fit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org)

`llm-fit` is a production-ready, open-source CLI that scans your hardware and recommends local LLMs and coding-focused models tailored to your machine's capabilities. No guesswork — just models that will actually run.

---

## Table of Contents

- [Features](#features)
- [Requirements](#requirements)
- [Installation](#installation)
- [Usage](#usage)
- [Commands](#commands)
- [Output Design](#output-design)
- [Project Structure](#project-structure)
- [Extensibility](#extensibility)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- **Hardware scan** — detects RAM, CPU, GPU, VRAM, OS, and WSL
- **Tiered recommendations** — Recommended, Might Work, and Not Recommended
- **Curated model catalog** — filterable by category (general, coding)
- **One-command installs** — install models directly through Ollama
- **Trending model sync** — pull latest GGUF models from Hugging Face
- **ESM-only codebase** — modern Node.js ecosystem compatible

---

## Requirements

- **Node.js** 18+
- **npm**
- **Ollama** *(optional — only required for the `install` command)*

---

## Installation

### From npm *(recommended)*

```bash
npm install -g llm-fit
```

### From source

```bash
git clone https://github.com/your-username/llm-fit
cd llm-fit
npm install
npm link
```

---

## Usage

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

Run without global linking during development:

```bash
node index.js scan
node index.js recommend --category coding
```

---

## Commands

### `llm-fit scan`

Scans your local machine and prints a full hardware summary including RAM, CPU, GPU, VRAM, OS, and WSL status.

---

### `llm-fit recommend [--category <type>]`

Scans your machine and returns models grouped into three tiers: **Recommended**, **Might Work**, and **Not Recommended**.

| Flag | Description |
|---|---|
| `--category coding` | Show coding-focused models only |
| `--category general` | Show general-purpose models only |
| `--category all` | Show all curated models *(default)* |

---

### `llm-fit models [--category <type>] [--json]`

Lists all curated models in a table. Use `--json` to get raw JSON output for scripting or piping.

| Flag | Description |
|---|---|
| `--category coding` | Filter to coding models |
| `--category general` | Filter to general models |
| `--category all` | List all models *(default)* |
| `--json` | Output raw JSON |

---

### `llm-fit install <modelName>`

Installs a model via Ollama. Accepts either the local `name` or `ollama_tag`. If the model is not in the local catalog, the install is still attempted.

```bash
llm-fit install llama3.2:3b
llm-fit install codellama
```

> Requires [Ollama](https://ollama.com) to be installed and running.

---

### `llm-fit update-models`

Fetches trending GGUF models from Hugging Face and appends only new entries — curated records are never overwritten.

---

## Output Design

- **Cyan** section headers for scan and results sections
- **Green / Yellow / Red** tiers for recommendation status
- 80-column-friendly tables and boxed output throughout

---

## Project Structure

```
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

---

## Extensibility

`llm-fit` is designed with future extensibility in mind:

- **`services/recommender.js`** is intentionally stateless so the scoring function can be swapped for an AI-driven ranking service later.
- **`data/models.json`** is schema-version-ready; a top-level migration strategy can be introduced in a future release.
- **`services/huggingface.js`** uses only Node built-ins (`https`), making it easy to layer in retry logic, caching, or offline fallback without external HTTP libraries.

---

## Contributing

Contributions are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes with clear messages
4. Open a pull request with before/after command output samples

Please keep PRs focused. Bug fixes and new model catalog entries are always appreciated.

---

## License

MIT © 2025

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
