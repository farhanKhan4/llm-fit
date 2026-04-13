import { promises as fs } from 'node:fs';
import si from 'systeminformation';

function toRoundedGbFromBytes(valueInBytes) {
  if (valueInBytes === null || valueInBytes === undefined) {
    return null;
  }

  const raw = Number(valueInBytes);
  if (!Number.isFinite(raw) || raw <= 0) {
    return null;
  }

  const gb = raw / (1024 ** 3);
  return Math.max(1, Math.round(gb));
}

function toRoundedGbFromMb(valueInMb) {
  if (valueInMb === null || valueInMb === undefined) {
    return null;
  }

  const raw = Number(valueInMb);
  if (!Number.isFinite(raw) || raw <= 0) {
    return null;
  }

  const gb = raw / 1024;
  return Math.max(1, Math.round(gb));
}

function hasDiscreteGpuController(controller) {
  if (!controller || !controller.model) {
    return false;
  }

  const text = `${controller.vendor || ''} ${controller.model}`.toLowerCase();
  if (!text.trim()) {
    return false;
  }

  const integratedHints = [
    'intel',
    'integrated',
    'uhd',
    'iris',
    'vega 3',
    'virtual',
    'microsoft basic'
  ];
  return !integratedHints.some((hint) => text.includes(hint));
}

async function detectWSL() {
  if (process.platform !== 'linux') {
    return false;
  }

  try {
    const procVersion = await fs.readFile('/proc/version', 'utf8');
    return procVersion.toLowerCase().includes('microsoft');
  } catch {
    return false;
  }
}

export async function scanSystemHardware() {
  const [memInfo, cpuInfo, osInfo, graphicsInfo, isWSL] = await Promise.all([
    si.mem().catch(() => ({ total: 0 })),
    si.cpu().catch(() => ({ brand: 'Unknown CPU', physicalCores: 0, speed: 0 })),
    si.osInfo().catch(() => ({ distro: process.platform, release: '' })),
    si.graphics().catch(() => ({ controllers: [] })),
    detectWSL()
  ]);

  const controllers = Array.isArray(graphicsInfo.controllers)
    ? graphicsInfo.controllers
    : [];

  const discrete = controllers.find(hasDiscreteGpuController);
  const fallback = controllers[0];
  const gpuModel = discrete?.model || fallback?.model || 'Integrated / Unknown';
  const gpuVramGb = toRoundedGbFromMb(discrete?.vram ?? fallback?.vram);

  const osName = [osInfo.distro, osInfo.release].filter(Boolean).join(' ').trim();

  return {
    ram: toRoundedGbFromBytes(memInfo.total) || 0,
    cpu: {
      brand: cpuInfo.brand || 'Unknown CPU',
      cores: cpuInfo.physicalCores || cpuInfo.cores || 0,
      speed: Number(cpuInfo.speed) || 0
    },
    gpu: {
      model: discrete ? gpuModel : 'Integrated / Unknown',
      vram: discrete ? gpuVramGb : null
    },
    os: osName || process.platform,
    isWSL
  };
}
