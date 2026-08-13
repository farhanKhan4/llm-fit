import { execSync, spawn } from 'node:child_process';

/**
 * Check whether the `ollama` binary is present on PATH.
 * Returns true if found, false otherwise.
 */
export function isOllamaInstalled() {
  const checkCmd = process.platform === 'win32' ? 'where ollama' : 'which ollama';
  try {
    execSync(checkCmd, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Pull a model tag via `ollama pull`.
 *
 * @param {string} tag           - The Ollama tag to install (e.g. "llama3.2:1b")
 * @param {(line: string) => void} onStatus - Called for each line of Ollama output
 * @returns {Promise<void>}      - Resolves on success, rejects with Error on failure
 */
export function installModel(tag, onStatus) {
  return new Promise((resolve, reject) => {
    if (!isOllamaInstalled()) {
      reject(new Error('Ollama is not installed. Visit https://ollama.com/download'));
      return;
    }

    // Use 'pipe' so Ollama output doesn't bypass Ink's terminal renderer
    const child = spawn('ollama', ['pull', tag], {
      stdio: ['ignore', 'pipe', 'pipe']
    });

    const handleData = (chunk) => {
      const lines = chunk.toString().split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed) {
          onStatus(trimmed);
        }
      }
    };

    child.stdout.on('data', handleData);
    child.stderr.on('data', handleData);

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Ollama exited with code ${code}`));
      }
    });

    child.on('error', (err) => {
      reject(new Error(`Failed to launch Ollama: ${err.message}`));
    });
  });
}
