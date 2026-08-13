import { execSync } from 'node:child_process';
import { isOllamaInstalled } from './ollamaInstaller.js';

/**
 * Returns a list of models currently installed in Ollama.
 *
 * Each entry has:
 *   - name: string        e.g. "llama3.2:1b"
 *   - size: string        human-readable, e.g. "1.3 GB"
 *   - modifiedAt: string  ISO date string
 *
 * Throws if Ollama is not installed.
 * Returns an empty array if no models are installed.
 *
 * @returns {{ name: string, size: string, modifiedAt: string }[]}
 */
export function listInstalledModels() {
  if (!isOllamaInstalled()) {
    throw new Error('Ollama is not installed. Visit https://ollama.com/download');
  }

  // `ollama list` outputs tab-separated rows:
  // NAME          ID          SIZE    MODIFIED
  // llama3.2:1b   xyz123abc   1.3 GB  2 weeks ago
  let raw;
  try {
    raw = execSync('ollama list', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  } catch (err) {
    // Ollama is installed but not running, or another error
    const message = err.stderr ? err.stderr.toString().trim() : err.message;
    throw new Error(`Ollama is not responding: ${message || 'unknown error'}`);
  }

  const lines = raw.trim().split('\n');
  if (lines.length < 2) {
    // Only the header row — no models installed
    return [];
  }

  // Skip the header line (index 0), parse the rest
  const models = [];
  for (const line of lines.slice(1)) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Columns are separated by 2+ spaces (the CLI aligns them)
    const cols = trimmed.split(/\s{2,}/);
    if (cols.length < 3) continue;

    const name = cols[0].trim();
    const size = cols[2].trim();           // e.g. "1.3 GB"
    const modifiedAt = cols[3]?.trim() ?? ''; // e.g. "2 weeks ago"

    if (name) {
      models.push({ name, size, modifiedAt });
    }
  }

  return models;
}
