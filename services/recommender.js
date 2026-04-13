function clampScore(value) {
  if (value < 0) {
    return 0;
  }
  if (value > 100) {
    return 100;
  }
  return Math.round(value);
}

function hasDiscreteGpu(system) {
  const model = system?.gpu?.model || '';
  return model !== 'Integrated / Unknown';
}

function modelBenefitsFromGpu(model) {
  return (
    model.gpu_required === true ||
    model.vram_required !== null ||
    model.size_billion_params >= 7
  );
}

function getHardFilterFailures(system, model) {
  const failures = [];

  if (system.ram < model.min_ram) {
    failures.push(`Needs ${model.min_ram} GB RAM, you have ${system.ram} GB`);
  }

  if (model.gpu_required === true && !hasDiscreteGpu(system)) {
    failures.push('Requires a discrete GPU, none detected');
  }

  if (
    model.vram_required !== null &&
    system.gpu.vram !== null &&
    system.gpu.vram < model.vram_required
  ) {
    failures.push(
      `Needs ${model.vram_required} GB VRAM, you have ${system.gpu.vram} GB`
    );
  }

  return failures;
}

function scoreModel(system, model) {
  let score = 50;

  if (system.ram >= model.recommended_ram) {
    score += 20;
  }

  if (model.ollama_tag) {
    score += 15;
  }

  if (hasDiscreteGpu(system) && modelBenefitsFromGpu(model)) {
    score += 10;
  }

  const ramScaleLimit = system.ram * 1.5;
  const excessParams = Math.max(0, model.size_billion_params - ramScaleLimit);
  score -= Math.ceil(excessParams) * 5;

  if (system.ram < model.recommended_ram) {
    score -= 10;
  }

  return clampScore(score);
}

function buildMightWorkReason(system, model) {
  if (system.ram < model.recommended_ram) {
    return `Works best with ${model.recommended_ram} GB RAM; you have ${system.ram} GB.`;
  }

  return 'Can run, but performance may be slower for longer responses.';
}

function applyCategoryFilter(models, category) {
  if (!category || category === 'all') {
    return models;
  }

  return models.filter((model) => model.category === category);
}

export function rankModelsForSystem(system, models, category = 'all') {
  const filteredModels = applyCategoryFilter(models, category);

  const buckets = {
    recommended: [],
    mightWork: [],
    notRecommended: []
  };

  for (const model of filteredModels) {
    const failures = getHardFilterFailures(system, model);

    if (failures.length > 0) {
      buckets.notRecommended.push({
        model,
        score: 0,
        reasons: failures
      });
      continue;
    }

    const score = scoreModel(system, model);
    if (score >= 60) {
      buckets.recommended.push({
        model,
        score,
        reasons: ['Balanced fit for your current hardware.']
      });
    } else {
      buckets.mightWork.push({
        model,
        score,
        reasons: [buildMightWorkReason(system, model)]
      });
    }
  }

  const byScoreDesc = (a, b) => b.score - a.score;
  const bySizeAsc = (a, b) => a.model.size_billion_params - b.model.size_billion_params;

  buckets.recommended.sort(byScoreDesc);
  buckets.mightWork.sort((a, b) => byScoreDesc(a, b) || bySizeAsc(a, b));
  buckets.notRecommended.sort(bySizeAsc);

  return buckets;
}
