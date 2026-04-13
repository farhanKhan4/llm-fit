import path from 'node:path';
import { promises as fs } from 'node:fs';
import { execSync, spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import chalk from 'chalk';
import ora from 'ora';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MODELS_PATH = path.join(__dirname, '..', 'data', 'models.json');

async function loadModels() {
  const raw = await fs.readFile(MODELS_PATH, 'utf8');
  const parsed = JSON.parse(raw.replace(/^\uFEFF/, ''));

  if (!Array.isArray(parsed)) {
    throw new Error('Model database is invalid: expected an array');
  }

  return parsed;
}

function resolveInstallTarget(models, modelNameInput) {
  const normalized = modelNameInput.toLowerCase();
  const found = models.find((model) => {
    const byName = String(model.name || '').toLowerCase() === normalized;
    const byTag = String(model.ollama_tag || '').toLowerCase() === normalized;
    return byName || byTag;
  });

  if (!found) {
    return {
      model: null,
      tag: modelNameInput
    };
  }

  return {
    model: found,
    tag: found.ollama_tag || found.name
  };
}

function ensureOllamaInstalled() {
  const checkCmd = process.platform === 'win32' ? 'where ollama' : 'which ollama';

  try {
    execSync(checkCmd, { stdio: 'ignore' });
  } catch {
    throw new Error(
      'Ollama is not installed. Install it from https://ollama.com/download'
    );
  }
}

async function pullModelViaOllama(tag) {
  const spinner = ora(`Preparing Ollama install for ${tag}...`).start();

  return new Promise((resolve, reject) => {
    try {
      ensureOllamaInstalled();
      spinner.text = `Installing ${tag} via Ollama...`;
    } catch (error) {
      spinner.fail('Ollama not found');
      reject(error);
      return;
    }

    const child = spawn('ollama', ['pull', tag], {
      stdio: 'inherit'
    });

    child.on('close', (code) => {
      if (code === 0) {
        spinner.succeed(`Installed ${tag}`);
        resolve();
        return;
      }

      spinner.fail(`Install failed for ${tag}`);
      reject(new Error(`Ollama exited with code ${code}`));
    });

    child.on('error', (error) => {
      spinner.fail(`Install failed for ${tag}`);
      reject(new Error(`Failed to launch Ollama: ${error.message}`));
    });
  });
}

export function registerInstallCommand(program) {
  program
    .command('install <modelName>')
    .description('Install a model via Ollama')
    .action(async (modelName) => {
      try {
        const models = await loadModels();
        const resolved = resolveInstallTarget(models, modelName);

        if (!resolved.model) {
          console.log(
            chalk.yellow(
              `⚠️ Model '${modelName}' not found in local database. Attempting install anyway.`
            )
          );
        }

        await pullModelViaOllama(resolved.tag);
        process.exit(0);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown install error';
        console.error(chalk.red(`❌ ${message}`));
        process.exit(1);
      }
    });
}
