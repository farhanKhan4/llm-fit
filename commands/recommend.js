import path from 'node:path';
import { promises as fs } from 'node:fs';
import { fileURLToPath } from 'node:url';
import ora from 'ora';
import { scanSystemHardware } from '../services/systemScanner.js';
import { rankModelsForSystem } from '../services/recommender.js';
import {
  formatRecommendationBuckets,
  formatSectionHeader
} from '../utils/formatter.js';

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

export function registerRecommendCommand(program) {
  program
    .command('recommend')
    .description('Recommend models based on your hardware')
    .option('--category <category>', 'coding|general|all', 'all')
    .action(async (options) => {
      const category = String(options.category || 'all').toLowerCase();
      if (!['coding', 'general', 'all'].includes(category)) {
        console.error("error: invalid --category. Use 'coding', 'general', or 'all'.");
        process.exit(1);
      }

      const spinner = ora('Scanning your system hardware...').start();

      try {
        const [system, models] = await Promise.all([
          scanSystemHardware(),
          loadModels()
        ]);

        spinner.succeed('Hardware scan complete');

        const buckets = rankModelsForSystem(system, models, category);
        console.log(formatSectionHeader('Model Recommendations'));
        console.log(formatRecommendationBuckets(buckets));
        process.exit(0);
      } catch (error) {
        spinner.fail('Recommendation failed');
        const message =
          error instanceof Error ? error.message : 'Unknown recommendation error';
        console.error(`error: ${message}`);
        process.exit(1);
      }
    });
}
