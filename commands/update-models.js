import path from 'node:path';
import { promises as fs } from 'node:fs';
import { fileURLToPath } from 'node:url';
import ora from 'ora';
import {
  fetchTrendingGgufModels,
  mergeModelsWithLocalDb,
  writeJsonAtomic
} from '../services/huggingface.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MODELS_PATH = path.join(__dirname, '..', 'data', 'models.json');

async function readLocalModels() {
  const raw = await fs.readFile(MODELS_PATH, 'utf8');
  const parsed = JSON.parse(raw.replace(/^\uFEFF/, ''));

  if (!Array.isArray(parsed)) {
    throw new Error('Model database is invalid: expected an array');
  }

  return parsed;
}

export function registerUpdateModelsCommand(program) {
  program
    .command('update-models')
    .description('Sync trending GGUF models from Hugging Face')
    .action(async () => {
      const spinner = ora('Syncing models from Hugging Face...').start();

      try {
        const localModels = await readLocalModels();
        const fetched = await fetchTrendingGgufModels();
        const { merged, addedCount } = mergeModelsWithLocalDb(localModels, fetched);

        await writeJsonAtomic(MODELS_PATH, merged);

        spinner.succeed('Model database updated');
        console.log(
          `Added ${addedCount} new models. Database now has ${merged.length} models.`
        );
        process.exit(0);
      } catch (error) {
        spinner.fail('Model sync failed');
        const message = error instanceof Error ? error.message : 'Unknown sync error';
        console.error(`error: ${message}`);
        process.exit(1);
      }
    });
}
