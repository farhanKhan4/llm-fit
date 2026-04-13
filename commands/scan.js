import ora from 'ora';
import { scanSystemHardware } from '../services/systemScanner.js';
import { formatSectionHeader, formatSystemBox } from '../utils/formatter.js';

export function registerScanCommand(program) {
  program
    .command('scan')
    .description('Scan and print system hardware information')
    .action(async () => {
      const spinner = ora('Scanning your system hardware...').start();

      try {
        const system = await scanSystemHardware();
        spinner.succeed('Hardware scan complete');
        console.log(formatSectionHeader('System Info'));
        console.log(formatSystemBox(system));
        process.exit(0);
      } catch (error) {
        spinner.fail('Hardware scan failed');
        const message = error instanceof Error ? error.message : 'Unknown scan error';
        console.error(`error: ${message}`);
        process.exit(1);
      }
    });
}
