#!/usr/bin/env node

import path from 'node:path';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { Command } from 'commander';
import { registerScanCommand } from './commands/scan.js';
import { registerRecommendCommand } from './commands/recommend.js';
import { registerModelsCommand } from './commands/models.js';
import { registerInstallCommand } from './commands/install.js';
import { registerUpdateModelsCommand } from './commands/update-models.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageJson = JSON.parse(
  readFileSync(path.join(__dirname, 'package.json'), 'utf8')
);

const program = new Command();
program
  .name('llm-fit')
  .description(
    'Scan hardware and recommend local LLM models and coding agents you can run.'
  )
  .version(packageJson.version)
  .showHelpAfterError();

registerScanCommand(program);
registerRecommendCommand(program);
registerModelsCommand(program);
registerInstallCommand(program);
registerUpdateModelsCommand(program);

const firstArg = process.argv[2];
if (
  firstArg &&
  !firstArg.startsWith('-') &&
  !program.commands.some((cmd) => cmd.name() === firstArg)
) {
  console.error(`error: unknown command '${firstArg}'`);
  console.error("hint: run 'llm-fit --help' for available commands");
  process.exit(1);
}

if (process.argv.length <= 2) {
  program.outputHelp();
  process.exit(0);
}

try {
  await program.parseAsync(process.argv);
} catch (error) {
  const message = error instanceof Error ? error.message : 'Unexpected CLI error';
  console.error(`error: ${message}`);
  process.exit(1);
}
