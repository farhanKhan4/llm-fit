import https from 'node:https';
import path from 'node:path';
import { promises as fs } from 'node:fs';

const HF_URL =
  'https://huggingface.co/api/models?filter=gguf&sort=downloads&limit=20';

function requestJson(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let body = '';

        if (res.statusCode && res.statusCode >= 400) {
          reject(
            new Error(
              `Hugging Face request failed with status ${res.statusCode}`
            )
          );
          res.resume();
          return;
        }

        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          body += chunk;
        });

        res.on('end', () => {
          try {
            resolve(JSON.parse(body));
          } catch {
            reject(new Error('Failed to parse Hugging Face API response JSON'));
          }
        });
      })
      .on('error', (error) => {
        reject(new Error(`Network error while contacting Hugging Face: ${error.message}`));
      });
  });
}

function inferSizeFromTags(tags = []) {
  const joined = tags.join(' ');
  const match = joined.match(/(\d+(?:\.\d+)?)b/i);
  if (!match) {
    return 7;
  }

  const value = Number(match[1]);
  return Number.isFinite(value) ? value : 7;
}

function normalizeHfEntry(item) {
  const tags = Array.isArray(item.tags) ? item.tags : [];
  const size = inferSizeFromTags(tags);
  const modelId = item.id;

  return {
    name: modelId.toLowerCase(),
    display_name: modelId,
    category: tags.some((tag) => tag.toLowerCase().includes('code'))
      ? 'coding'
      : 'general',
    min_ram: size <= 3 ? 4 : size <= 8 ? 8 : 16,
    recommended_ram: size <= 3 ? 8 : size <= 8 ? 16 : 32,
    gpu_required: size > 12,
    vram_required: size > 12 ? Math.max(12, Math.round(size * 0.75)) : null,
    size_billion_params: size,
    ollama_tag: null,
    huggingface_id: modelId,
    supported_runtimes: ['gguf'],
    use_cases: ['chat'],
    notes: `Imported from Hugging Face (downloads: ${item.downloads || 0}, updated: ${item.lastModified || 'unknown'}).`,
    license: tags.find((tag) => tag.startsWith('license:'))?.replace('license:', '') ||
      'Unknown'
  };
}

export async function fetchTrendingGgufModels() {
  const payload = await requestJson(HF_URL);
  if (!Array.isArray(payload)) {
    throw new Error('Unexpected Hugging Face API response shape');
  }

  return payload.map((item) => ({
    modelId: item.id,
    downloads: item.downloads || 0,
    tags: Array.isArray(item.tags) ? item.tags : [],
    lastModified: item.lastModified || null,
    raw: item
  }));
}

export function mergeModelsWithLocalDb(existingModels, fetchedModels) {
  const existingIds = new Set(existingModels.map((model) => model.huggingface_id));
  const additions = [];

  for (const fetched of fetchedModels) {
    if (!fetched.modelId || existingIds.has(fetched.modelId)) {
      continue;
    }

    additions.push(
      normalizeHfEntry({
        id: fetched.modelId,
        downloads: fetched.downloads,
        tags: fetched.tags,
        lastModified: fetched.lastModified
      })
    );
    existingIds.add(fetched.modelId);
  }

  return {
    merged: [...existingModels, ...additions],
    addedCount: additions.length
  };
}

export async function writeJsonAtomic(filePath, data) {
  const directory = path.dirname(filePath);
  const tempPath = path.join(
    directory,
    `${path.basename(filePath)}.tmp-${Date.now()}`
  );

  await fs.writeFile(tempPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  await fs.rename(tempPath, filePath);
}
