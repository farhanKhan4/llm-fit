function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function scoreRam(ramGb) {
  if (ramGb >= 32) {
    return 40;
  }
  if (ramGb >= 16) {
    return 35;
  }
  if (ramGb >= 8) {
    return 25;
  }
  if (ramGb >= 4) {
    return 10;
  }
  return 0;
}

function scoreCpuCores(cores) {
  if (cores >= 12) {
    return 25;
  }
  if (cores >= 8) {
    return 20;
  }
  if (cores >= 6) {
    return 15;
  }
  if (cores >= 4) {
    return 10;
  }
  return 5;
}

function hasDedicatedGpu(model) {
  const text = String(model || '').toLowerCase();
  if (!text.trim()) {
    return false;
  }

  const integratedHints = [
    'integrated',
    'intel',
    'uhd',
    'iris',
    'vega 3',
    'microsoft basic',
    'virtual',
    'unknown'
  ];

  return !integratedHints.some((hint) => text.includes(hint));
}

function scoreGpu(model) {
  const text = String(model || '').toLowerCase();
  if (!hasDedicatedGpu(text)) {
    return 0;
  }

  if (text.includes('nvidia') || text.includes('amd') || text.includes('radeon')) {
    return 25;
  }

  return 15;
}

function scoreVram(vramGb) {
  if (vramGb === null || vramGb === undefined) {
    return 0;
  }

  if (vramGb >= 8) {
    return 10;
  }
  if (vramGb >= 4) {
    return 6;
  }
  if (vramGb > 0) {
    return 3;
  }

  return 0;
}

function resolveGrade(score) {
  if (score >= 85) {
    return { grade: 'A', label: 'Excellent' };
  }
  if (score >= 70) {
    return { grade: 'B+', label: 'Very Good' };
  }
  if (score >= 55) {
    return { grade: 'B', label: 'Capable' };
  }
  if (score >= 40) {
    return { grade: 'C', label: 'Limited' };
  }
  if (score >= 20) {
    return { grade: 'D', label: 'Minimal' };
  }

  return { grade: 'F', label: 'Not Recommended' };
}

function buildVerdict(score, hasGpu) {
  if (score >= 85) {
    return 'Ready for large models (13B+). GPU acceleration available.';
  }

  if (score >= 55) {
    const tail = hasGpu ? 'GPU acceleration available.' : 'GPU acceleration unavailable.';
    return `Can run small to mid-size models (3B-7B) comfortably. ${tail}`;
  }

  if (score >= 40) {
    return 'Best suited for lightweight models (1B-3B). Expect slow inference.';
  }

  return 'Very limited. Only tiny models (<=1B) may work. Consider upgrading RAM.';
}

export function computeScore(hardwareInfo) {
  const ram = Number(hardwareInfo?.ram) || 0;
  const cores = Number(hardwareInfo?.cpu?.cores) || 0;
  const gpuModel = hardwareInfo?.gpu?.model || 'Integrated / Unknown';
  const vram = hardwareInfo?.gpu?.vram;

  const breakdown = {
    ram: scoreRam(ram),
    cpu: scoreCpuCores(cores),
    gpu: scoreGpu(gpuModel),
    vram: scoreVram(vram)
  };

  const total = clamp(
    breakdown.ram + breakdown.cpu + breakdown.gpu + breakdown.vram,
    0,
    100
  );
  const { grade, label } = resolveGrade(total);

  return {
    score: total,
    grade,
    label,
    breakdown,
    verdict: buildVerdict(total, hasDedicatedGpu(gpuModel))
  };
}