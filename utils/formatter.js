import chalk from 'chalk';

const MAX_WIDTH = 80;

function terminalWidth() {
  const width = process.stdout.columns || MAX_WIDTH;
  return Math.min(width, MAX_WIDTH);
}

function truncate(value, width) {
  const str = String(value ?? '');
  if (str.length <= width) {
    return str.padEnd(width, ' ');
  }
  return `${str.slice(0, Math.max(0, width - 1))}…`;
}

export function formatSectionHeader(title) {
  return chalk.cyan.bold(`\n── ${title} ──`);
}

export function formatSystemBox(system) {
  const contentWidth = Math.min(27, terminalWidth() - 4);
  const top = `┌${'─'.repeat(contentWidth + 2)}┐`;
  const mid = `├${'─'.repeat(contentWidth + 2)}┤`;
  const bottom = `└${'─'.repeat(contentWidth + 2)}┘`;

  const title = 'System Hardware';
  const centeredTitle = title
    .padStart(Math.floor((contentWidth + title.length) / 2), ' ')
    .padEnd(contentWidth, ' ');

  const rows = [
    ['RAM', `${system.ram} GB`],
    ['CPU', system.cpu.brand],
    ['Cores', system.cpu.cores],
    ['GPU', system.gpu.model],
    ['VRAM', system.gpu.vram === null ? 'Unknown' : `${system.gpu.vram} GB`],
    ['OS', system.os]
  ];

  if (system.isWSL) {
    rows.push(['WSL', 'Detected']);
  }

  const body = rows
    .map(([label, value]) => {
      const left = `  ${label}`.padEnd(8, ' ');
      const valueText = String(value);
      const valueWidth = Math.max(0, contentWidth - left.length - 3);
      const right = truncate(valueText, valueWidth);
      const line = `${left}: ${chalk.blue(right)}`;
      return `│ ${line} │`;
    })
    .join('\n');

  return [
    top,
    `│ ${centeredTitle} │`,
    mid,
    body,
    bottom
  ].join('\n');
}

export function formatModelsTable(models) {
  const headers = [
    { key: 'display_name', label: 'Name', width: 24 },
    { key: 'category', label: 'Category', width: 10 },
    { key: 'min_ram', label: 'Min RAM', width: 8 },
    { key: 'recommended_ram', label: 'Rec. RAM', width: 8 },
    { key: 'size_billion_params', label: 'Size', width: 8 },
    { key: 'runtime', label: 'Runtime', width: 16 }
  ];

  const renderHeader = headers
    .map((column) => truncate(column.label, column.width))
    .join(' | ');

  const separator = headers.map((column) => '-'.repeat(column.width)).join('-+-');

  const rows = models.map((model) => {
    const runtime = Array.isArray(model.supported_runtimes)
      ? model.supported_runtimes.join(',')
      : '';

    const data = {
      ...model,
      min_ram: `${model.min_ram} GB`,
      recommended_ram: `${model.recommended_ram} GB`,
      size_billion_params: `${model.size_billion_params}B`,
      runtime
    };

    return headers
      .map((column) => truncate(data[column.key] ?? '', column.width))
      .join(' | ');
  });

  return [chalk.cyan.bold(renderHeader), chalk.gray(separator), ...rows].join('\n');
}

function renderTierTitle(title, colorFn) {
  return colorFn(title);
}

function formatModelLine(entry) {
  const model = entry.model;
  const name = chalk.white.bold(model.display_name);
  const meta = chalk.gray(
    `${model.size_billion_params}B | Min RAM ${model.min_ram} GB | Score ${entry.score}`
  );
  const note = chalk.gray(entry.reasons[0] || model.notes);
  return `- ${name}\n  ${meta}\n  ${note}`;
}

function renderTierEntries(entries, emptyMessage) {
  if (entries.length === 0) {
    return chalk.gray(`- ${emptyMessage}`);
  }

  return entries.map(formatModelLine).join('\n');
}

export function formatRecommendationBuckets(buckets) {
  const sections = [
    `${renderTierTitle('✅ Recommended', chalk.green)}\n${renderTierEntries(
      buckets.recommended,
      'No strong matches found.'
    )}`,
    `${renderTierTitle('⚠️ Might Work', chalk.yellow)}\n${renderTierEntries(
      buckets.mightWork,
      'No borderline candidates.'
    )}`,
    `${renderTierTitle('❌ Not Recommended', chalk.red)}\n${renderTierEntries(
      buckets.notRecommended,
      'No blocked models.'
    )}`
  ];

  return sections.join('\n\n');
}
