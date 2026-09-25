import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function registerTuiCommand(program) {
  program
    .command('tui')
    .description('Launch the interactive Terminal User Interface (TUI)')
    .action(() => {
      const tuiPath = path.join(__dirname, '..', 'tui', 'dist', 'index.js');

      const child = spawn(process.execPath, [tuiPath], {
        stdio: 'inherit',
        env: process.env,
      });

      child.on('error', (err) => {
        console.error(`Error launching TUI: ${err.message}`);
        process.exit(1);
      });

      child.on('exit', (code) => {
        process.exit(code !== null ? code : 1);
      });
    });
}
