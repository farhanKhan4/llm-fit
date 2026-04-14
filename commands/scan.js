import ora from 'ora';
import chalk from 'chalk';
import { scanSystemHardware } from '../services/systemScanner.js';
import { formatSectionHeader, formatSystemBox } from '../utils/formatter.js';
import { computeScore } from '../utils/scoreEngine.js';

const BAR_WIDTH = 30;

function getScoreColor(score) {
  if (score >= 70) {
    return chalk.green;
  }
  if (score >= 40) {
    return chalk.yellow;
  }
  return chalk.red;
}

function toBar(value, max) {
  const ratio = max <= 0 ? 0 : value / max;
  const filledCount = Math.max(0, Math.min(BAR_WIDTH, Math.round(ratio * BAR_WIDTH)));
  return `${'█'.repeat(filledCount)}${'░'.repeat(BAR_WIDTH - filledCount)}`;
}

function formatVerdictLines(verdict) {
  const [firstSentence, ...rest] = String(verdict).split('. ').filter(Boolean);
  if (rest.length === 0) {
    return [firstSentence.endsWith('.') ? firstSentence : `${firstSentence}.`];
  }

  const first = firstSentence.endsWith('.') ? firstSentence : `${firstSentence}.`;
  const second = rest.join('. ');
  return [first, second.endsWith('.') ? second : `${second}.`];
}

function formatReadinessSection(scoreResult) {
  const colorize = getScoreColor(scoreResult.score);
  const headlineBar = toBar(scoreResult.score, 100);
  const verdictLines = formatVerdictLines(scoreResult.verdict);
  const lines = [
    formatSectionHeader('LLM Readiness Score'),
    '',
    `  ${colorize(headlineBar)}  ${scoreResult.score} / 100`,
    '',
    `  Grade   : ${scoreResult.grade}  -  ${scoreResult.label}`,
    `  Verdict : ${verdictLines[0]}`
  ];

  if (verdictLines[1]) {
    lines.push(`            ${verdictLines[1]}`);
  }

  lines.push('', '  Breakdown:');

  const breakdownRows = [
    ['RAM', scoreResult.breakdown.ram, 40],
    ['CPU Cores', scoreResult.breakdown.cpu, 25],
    ['GPU', scoreResult.breakdown.gpu, 25],
    ['VRAM', scoreResult.breakdown.vram, 10]
  ];

  for (const [label, value, max] of breakdownRows) {
    const paddedLabel = String(label).padEnd(11, ' ');
    lines.push(`    ${paddedLabel} ${toBar(value, max)}  ${value} / ${max}`);
  }

  return lines.join('\n');
}

export async function scanSystemWithScore() {
  const system = await scanSystemHardware();
  const score = computeScore(system);
  return { system, score };
}

export function registerScanCommand(program) {
  program
    .command('scan')
    .description('Scan and print system hardware information')
    .action(async () => {
      const spinner = ora('Scanning your system hardware...').start();

      try {
        const { system, score } = await scanSystemWithScore();
        spinner.succeed('Hardware scan complete');
        console.log(formatSectionHeader('System Info'));
        console.log(formatSystemBox(system));
        console.log(formatReadinessSection(score));
        process.exit(0);
      } catch (error) {
        spinner.fail('Hardware scan failed');
        const message = error instanceof Error ? error.message : 'Unknown scan error';
        console.error(`error: ${message}`);
        process.exit(1);
      }
    });
}
