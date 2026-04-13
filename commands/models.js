import path from 'node:path';
import { promises as fs } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { formatModelsTable, formatSectionHeader } from '../utils/formatter.js';

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

function filterByCategory(models, category) {
  if (category === 'all') {
    return models;
  }

  return models.filter((model) => model.category === category);
}

export function registerModelsCommand(program) {
  program
    .command('models')
    .description('List all curated models')
    .option('--category <category>', 'coding|general|all', 'all')
    .option('--json', 'Output as raw JSON', false)
    .action(async (options) => {
      const category = String(options.category || 'all').toLowerCase();
      if (!['coding', 'general', 'all'].includes(category)) {
        console.error("error: invalid --category. Use 'coding', 'general', or 'all'.");
        process.exit(1);
      }

      try {
        const models = await loadModels();
        const filtered = filterByCategory(models, category);

        if (options.json) {
          console.log(JSON.stringify(filtered, null, 2));
          process.exit(0);
        }

        console.log(formatSectionHeader('Model Catalog'));
        console.log(formatModelsTable(filtered));
        process.exit(0);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown models error';
        console.error(`error: ${message}`);
        process.exit(1);
      }
    });
}
