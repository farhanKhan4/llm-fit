import chalk from 'chalk';

const BANNER = String.raw` ___       ___       _____ ______                  ________ ___  _________   
|\  \     |\  \     |\   _ \  _   \               |\  _____\\  \|\___   ___\ 
\ \  \    \ \  \    \ \  \\\__\ \  \  ____________\ \  \__/\ \  \|___ \  \_| 
 \ \  \    \ \  \    \ \  \\|__| \  \|\____________\ \   __\\ \  \   \ \  \  
  \ \  \____\ \  \____\ \  \    \ \  \|____________|\ \  \_| \ \  \   \ \  \ 
   \ \_______\ \_______\ \__\    \ \__\              \ \__\   \ \__\   \ \__\
    \|_______|\|_______|\|__|     \|__|               \|__|    \|__|    \|__|`;

export function printBanner() {
  console.log('');
  console.log(chalk.cyan.bold(BANNER));
  console.log('');
  console.log(
    chalk.gray('  Find the best LLMs your machine can actually run  ')
  );
  console.log('');
}
