import chalk from 'chalk';

const GLYPHS = {
  L: [
    [1, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 0]
  ],
  M: [
    [1, 0, 0, 0, 0, 0, 1],
    [1, 1, 0, 0, 0, 1, 1],
    [1, 0, 1, 0, 1, 0, 1],
    [1, 0, 0, 1, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 1]
  ],
  F: [
    [1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 0],
    [1, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0]
  ],
  I: [
    [1, 1, 1, 1, 1],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [1, 1, 1, 1, 1]
  ],
  T: [
    [1, 1, 1, 1, 1, 1, 1],
    [0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0]
  ],
  ' ': [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0]
  ]
};

const WORD = ['L', 'L', 'M', ' ', 'F', 'I', 'T'];
const FILLED = '█ ';
const EMPTY = '  ';

function renderRow(glyph, rowIndex) {
  return glyph[rowIndex].map((cell) => (cell === 1 ? FILLED : EMPTY)).join('');
}

export function printBanner() {
  const lines = [];

  for (let row = 0; row < 7; row += 1) {
    const line = WORD.map((char) => renderRow(GLYPHS[char], row)).join(' ');
    lines.push(chalk.cyanBright(line));
  }

  console.log(lines.join('\n'));
  console.log(
    chalk.gray('  Find the best LLMs your machine can actually run')
  );
  console.log('');
}
