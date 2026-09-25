// tui/index.jsx
import React10 from "react";
import { render } from "ink";

// tui/App.jsx
import React9, { useState as useState5, useEffect as useEffect4 } from "react";
import { Box as Box9, Text as Text9, useInput as useInput5, useApp as useApp5 } from "ink";

// tui/components/Header.jsx
import React from "react";
import { Box, Text } from "ink";
function Header() {
  return /* @__PURE__ */ React.createElement(Box, { borderStyle: "single", borderBottom: false, flexDirection: "column", alignItems: "center", borderColor: "cyan" }, /* @__PURE__ */ React.createElement(Text, { bold: true, color: "cyan" }, "\u26A1 LLM-FIT"), /* @__PURE__ */ React.createElement(Text, { color: "gray" }, "Local LLM Compatibility Tool"));
}

// tui/components/SystemCard.jsx
import React2 from "react";
import { Box as Box2, Text as Text2 } from "ink";
function SystemCard({ data, error }) {
  const renderValue = (label, value, isPlaceholder = false) => {
    let color = "white";
    if (isPlaceholder) {
      color = "gray";
    } else if (value === "Not detected" || value === "N/A" || value === "Integrated / Unknown") {
      color = "gray";
    }
    return /* @__PURE__ */ React2.createElement(Box2, { key: label }, /* @__PURE__ */ React2.createElement(Box2, { width: 10 }, /* @__PURE__ */ React2.createElement(Text2, { bold: true }, label)), /* @__PURE__ */ React2.createElement(Text2, { color }, value));
  };
  return /* @__PURE__ */ React2.createElement(Box2, { flexDirection: "column", marginTop: 1 }, /* @__PURE__ */ React2.createElement(Box2, { borderStyle: "single", flexDirection: "column", paddingX: 1, borderColor: "gray" }, /* @__PURE__ */ React2.createElement(Box2, { marginBottom: 1 }, /* @__PURE__ */ React2.createElement(Text2, { bold: true, color: "blueBright" }, "SYSTEM")), error ? /* @__PURE__ */ React2.createElement(Box2, { paddingY: 1 }, /* @__PURE__ */ React2.createElement(Text2, { color: "red" }, "Scanner Error: ", error)) : !data ? /* @__PURE__ */ React2.createElement(Box2, { flexDirection: "column" }, renderValue("CPU", "Scanning...", true), renderValue("RAM", "Scanning...", true), renderValue("GPU", "Scanning...", true), renderValue("VRAM", "Scanning...", true)) : /* @__PURE__ */ React2.createElement(Box2, { flexDirection: "column" }, renderValue("CPU", data.cpu?.brand || "Unknown CPU"), renderValue("RAM", data.ram ? `${data.ram} GB` : "Unknown"), renderValue("GPU", data.gpu?.model || "Not detected"), renderValue("VRAM", data.gpu?.vram ? `${data.gpu.vram} GB` : "N/A"))));
}

// tui/components/QuickActions.jsx
import React3 from "react";
import { Box as Box3, Text as Text3 } from "ink";
function QuickActions({ actions, selectedIndex, actionMessage }) {
  return /* @__PURE__ */ React3.createElement(Box3, { flexDirection: "column", marginTop: 1 }, /* @__PURE__ */ React3.createElement(Box3, { marginBottom: 1 }, /* @__PURE__ */ React3.createElement(Text3, { bold: true, color: "blueBright" }, "QUICK ACTIONS")), /* @__PURE__ */ React3.createElement(Box3, { flexDirection: "column" }, actions.map((action, index) => {
    const isSelected = index === selectedIndex;
    return /* @__PURE__ */ React3.createElement(Box3, { key: action }, /* @__PURE__ */ React3.createElement(Box3, { width: 2 }, /* @__PURE__ */ React3.createElement(Text3, { color: "green" }, isSelected ? "\u276F" : " ")), /* @__PURE__ */ React3.createElement(Text3, { color: isSelected ? "white" : "gray" }, action));
  })), actionMessage && /* @__PURE__ */ React3.createElement(Box3, { marginTop: 1 }, /* @__PURE__ */ React3.createElement(Text3, { color: "yellow" }, actionMessage)));
}

// tui/components/Footer.jsx
import React4 from "react";
import { Box as Box4, Text as Text4 } from "ink";
function Footer() {
  return /* @__PURE__ */ React4.createElement(Box4, { borderStyle: "single", borderTop: false, paddingX: 1, borderColor: "cyan" }, /* @__PURE__ */ React4.createElement(Text4, { color: "gray" }, "\u2191\u2193 Navigate    Enter Select    q Quit"));
}

// tui/components/RecommendedModels.jsx
import React7, { useState as useState3, useEffect as useEffect2 } from "react";
import { Box as Box7, Text as Text7, useInput as useInput3, useApp as useApp3 } from "ink";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

// services/recommender.js
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
  const model = system?.gpu?.model || "";
  return model !== "Integrated / Unknown";
}
function modelBenefitsFromGpu(model) {
  return model.gpu_required === true || model.vram_required !== null || model.size_billion_params >= 7;
}
function getHardFilterFailures(system, model) {
  const failures = [];
  if (system.ram < model.min_ram) {
    failures.push(`Needs ${model.min_ram} GB RAM, you have ${system.ram} GB`);
  }
  if (model.gpu_required === true && !hasDiscreteGpu(system)) {
    failures.push("Requires a discrete GPU, none detected");
  }
  if (model.vram_required !== null && system.gpu.vram !== null && system.gpu.vram < model.vram_required) {
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
  return "Can run, but performance may be slower for longer responses.";
}
function applyCategoryFilter(models, category) {
  if (!category || category === "all") {
    return models;
  }
  return models.filter((model) => model.category === category);
}
function rankModelsForSystem(system, models, category = "all") {
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
        reasons: ["Balanced fit for your current hardware."]
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

// tui/components/ModelDetails.jsx
import React6, { useState as useState2 } from "react";
import { Box as Box6, Text as Text6, useInput as useInput2, useApp as useApp2 } from "ink";

// tui/components/InstallScreen.jsx
import React5, { useState, useEffect } from "react";
import { Box as Box5, Text as Text5, useInput, useApp } from "ink";

// services/ollamaInstaller.js
import { execSync, spawn } from "node:child_process";
function isOllamaInstalled() {
  const checkCmd = process.platform === "win32" ? "where ollama" : "which ollama";
  try {
    execSync(checkCmd, { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}
function installModel(tag, onStatus) {
  return new Promise((resolve, reject) => {
    if (!isOllamaInstalled()) {
      reject(new Error("Ollama is not installed. Visit https://ollama.com/download"));
      return;
    }
    const child = spawn("ollama", ["pull", tag], {
      stdio: ["ignore", "pipe", "pipe"]
    });
    const handleData = (chunk) => {
      const lines = chunk.toString().split("\n");
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed) {
          onStatus(trimmed);
        }
      }
    };
    child.stdout.on("data", handleData);
    child.stderr.on("data", handleData);
    child.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Ollama exited with code ${code}`));
      }
    });
    child.on("error", (err) => {
      reject(new Error(`Failed to launch Ollama: ${err.message}`));
    });
  });
}

// tui/components/InstallScreen.jsx
function InstallScreen({ modelData, onBack }) {
  const { exit } = useApp();
  const { model } = modelData;
  const tag = model.ollama_tag || model.name;
  const [phase, setPhase] = useState("installing");
  const [statusLines, setStatusLines] = useState(["Connecting to Ollama..."]);
  const [errorMessage, setErrorMessage] = useState(null);
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (!isOllamaInstalled()) {
      setPhase("error");
      setErrorMessage("Ollama is not installed. Visit https://ollama.com/download");
      setDone(true);
      return;
    }
    setStatusLines([`Starting install for ${tag}...`]);
    installModel(tag, (line) => {
      setStatusLines((prev) => {
        const next = [...prev, line];
        return next.slice(-4);
      });
    }).then(() => {
      setPhase("success");
      setDone(true);
    }).catch((err) => {
      setPhase("error");
      setErrorMessage(err.message || "Unknown installation error");
      setDone(true);
    });
  }, []);
  useInput((input, key) => {
    if (!done) {
      return;
    }
    if (input === "q" && phase !== "installing") {
      exit();
      return;
    }
    if (key.escape || key.return) {
      onBack();
    }
  });
  if (phase === "installing") {
    return /* @__PURE__ */ React5.createElement(Box5, { flexDirection: "column", width: 56 }, /* @__PURE__ */ React5.createElement(Box5, { borderStyle: "single", borderBottom: false, flexDirection: "column", alignItems: "center", borderColor: "cyan" }, /* @__PURE__ */ React5.createElement(Text5, { bold: true, color: "cyan" }, "INSTALLING MODEL")), /* @__PURE__ */ React5.createElement(Box5, { borderStyle: "single", borderTop: false, borderBottom: false, borderColor: "cyan", flexDirection: "column", paddingX: 2, paddingY: 1 }, /* @__PURE__ */ React5.createElement(Box5, { marginBottom: 1 }, /* @__PURE__ */ React5.createElement(Text5, { bold: true, color: "white" }, model.display_name)), /* @__PURE__ */ React5.createElement(Box5, { marginBottom: 1 }, /* @__PURE__ */ React5.createElement(Text5, { color: "gray" }, "\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500")), statusLines.map((line, i) => /* @__PURE__ */ React5.createElement(Text5, { key: i, color: i === statusLines.length - 1 ? "white" : "gray" }, line))), /* @__PURE__ */ React5.createElement(Box5, { borderStyle: "single", borderTop: false, paddingX: 1, borderColor: "cyan" }, /* @__PURE__ */ React5.createElement(Text5, { color: "gray" }, "Please wait...")));
  }
  if (phase === "success") {
    return /* @__PURE__ */ React5.createElement(Box5, { flexDirection: "column", width: 56 }, /* @__PURE__ */ React5.createElement(Box5, { borderStyle: "single", borderBottom: false, flexDirection: "column", alignItems: "center", borderColor: "green" }, /* @__PURE__ */ React5.createElement(Text5, { bold: true, color: "green" }, "INSTALLATION COMPLETE")), /* @__PURE__ */ React5.createElement(Box5, { borderStyle: "single", borderTop: false, borderBottom: false, borderColor: "green", flexDirection: "column", paddingX: 2, paddingY: 1 }, /* @__PURE__ */ React5.createElement(Box5, { marginBottom: 1 }, /* @__PURE__ */ React5.createElement(Text5, { color: "green", bold: true }, "\u2713 ", model.display_name, " installed successfully")), /* @__PURE__ */ React5.createElement(Box5, { marginTop: 1, flexDirection: "column" }, /* @__PURE__ */ React5.createElement(Text5, { color: "gray" }, "Enter   Return to Model Details"), /* @__PURE__ */ React5.createElement(Text5, { color: "gray" }, "Esc     Return to Model Details"))), /* @__PURE__ */ React5.createElement(Box5, { borderStyle: "single", borderTop: false, paddingX: 1, borderColor: "green" }, /* @__PURE__ */ React5.createElement(Text5, { color: "gray" }, "Enter / Esc Back   q Quit")));
  }
  return /* @__PURE__ */ React5.createElement(Box5, { flexDirection: "column", width: 56 }, /* @__PURE__ */ React5.createElement(Box5, { borderStyle: "single", borderBottom: false, flexDirection: "column", alignItems: "center", borderColor: "red" }, /* @__PURE__ */ React5.createElement(Text5, { bold: true, color: "red" }, "INSTALLATION FAILED")), /* @__PURE__ */ React5.createElement(Box5, { borderStyle: "single", borderTop: false, borderBottom: false, borderColor: "red", flexDirection: "column", paddingX: 2, paddingY: 1 }, /* @__PURE__ */ React5.createElement(Box5, { marginBottom: 1 }, /* @__PURE__ */ React5.createElement(Text5, { color: "red", bold: true }, "\u2717 Unable to install ", model.display_name)), /* @__PURE__ */ React5.createElement(Box5, { marginBottom: 1 }, /* @__PURE__ */ React5.createElement(Text5, { color: "gray" }, errorMessage)), /* @__PURE__ */ React5.createElement(Box5, { marginTop: 1 }, /* @__PURE__ */ React5.createElement(Text5, { color: "gray" }, "Enter / Esc  Return to Model Details"))), /* @__PURE__ */ React5.createElement(Box5, { borderStyle: "single", borderTop: false, paddingX: 1, borderColor: "red" }, /* @__PURE__ */ React5.createElement(Text5, { color: "gray" }, "Enter / Esc Back   q Quit")));
}

// tui/components/ModelDetails.jsx
function ModelDetails({ modelData, systemData, onBack }) {
  const { exit } = useApp2();
  const [showInstall, setShowInstall] = useState2(false);
  useInput2((input, key) => {
    if (input === "q") {
      exit();
      return;
    }
    if (key.escape) {
      onBack();
      return;
    }
    if (key.return) {
      setShowInstall(true);
    }
  }, { isActive: !showInstall });
  if (showInstall) {
    return /* @__PURE__ */ React6.createElement(
      InstallScreen,
      {
        modelData,
        onBack: () => setShowInstall(false)
      }
    );
  }
  const { model, score, reasons, group } = modelData;
  const getCompatibilityLabel = () => {
    if (group === "recommended") return { label: "\u2713 Excellent", color: "green" };
    if (group === "mightWork") return { label: "\u2713 Good", color: "yellow" };
    return { label: "\u26A0 Limited", color: "red" };
  };
  const comp = getCompatibilityLabel();
  const renderRow = (label, value) => /* @__PURE__ */ React6.createElement(Box6, null, /* @__PURE__ */ React6.createElement(Box6, { width: 16 }, /* @__PURE__ */ React6.createElement(Text6, { bold: true }, label)), /* @__PURE__ */ React6.createElement(Box6, { flexGrow: 1 }, /* @__PURE__ */ React6.createElement(Text6, { color: "white" }, value)));
  return /* @__PURE__ */ React6.createElement(Box6, { flexDirection: "column", width: 56 }, /* @__PURE__ */ React6.createElement(Box6, { borderStyle: "single", borderBottom: false, flexDirection: "column", alignItems: "center", borderColor: "cyan" }, /* @__PURE__ */ React6.createElement(Text6, { bold: true, color: "cyan" }, "MODEL DETAILS")), /* @__PURE__ */ React6.createElement(Box6, { borderStyle: "single", borderTop: false, borderBottom: false, borderColor: "cyan", flexDirection: "column", paddingX: 2, paddingY: 1 }, /* @__PURE__ */ React6.createElement(Box6, { marginBottom: 1 }, /* @__PURE__ */ React6.createElement(Text6, { bold: true, color: "white" }, model.display_name)), /* @__PURE__ */ React6.createElement(Text6, { color: "gray" }, "\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500"), /* @__PURE__ */ React6.createElement(Box6, { flexDirection: "column", marginY: 1 }, renderRow("Parameters", `${model.size_billion_params}B`), renderRow("Category", model.category), renderRow("License", model.license || "N/A"), renderRow("Runtimes", model.supported_runtimes ? model.supported_runtimes.join(", ") : "N/A"), model.use_cases && renderRow("Use Cases", model.use_cases.join(", "))), /* @__PURE__ */ React6.createElement(Box6, { marginBottom: 1 }, /* @__PURE__ */ React6.createElement(Text6, { bold: true, color: "blueBright" }, "COMPATIBILITY")), /* @__PURE__ */ React6.createElement(Box6, { flexDirection: "column", marginBottom: 1 }, /* @__PURE__ */ React6.createElement(Text6, { color: comp.color, bold: true }, comp.label), /* @__PURE__ */ React6.createElement(Box6, { marginTop: 1, flexDirection: "column" }, renderRow("Score", score), renderRow("Reason", reasons && reasons.length > 0 ? reasons[0] : "N/A"))), /* @__PURE__ */ React6.createElement(Box6, { marginBottom: 1 }, /* @__PURE__ */ React6.createElement(Text6, { bold: true, color: "blueBright" }, "MEMORY & SYSTEM")), /* @__PURE__ */ React6.createElement(Box6, { flexDirection: "column", marginBottom: 1 }, renderRow("Min RAM", `${model.min_ram} GB`), renderRow("Rec. RAM", `${model.recommended_ram} GB`), renderRow("Available RAM", `${systemData.ram} GB`), renderRow("GPU Required", model.gpu_required ? "Yes" : "No"), renderRow("Available VRAM", systemData.gpu?.vram ? `${systemData.gpu.vram} GB` : "N/A")), /* @__PURE__ */ React6.createElement(Box6, { marginTop: 1 }, /* @__PURE__ */ React6.createElement(Box6, { width: 2 }, /* @__PURE__ */ React6.createElement(Text6, { color: "green" }, "\u276F")), /* @__PURE__ */ React6.createElement(Text6, { color: "white" }, "[ Install ]"))), /* @__PURE__ */ React6.createElement(Box6, { borderStyle: "single", borderTop: false, paddingX: 1, borderColor: "cyan" }, /* @__PURE__ */ React6.createElement(Text6, { color: "gray" }, "Enter Install   Esc Back   q Quit")));
}

// tui/components/RecommendedModels.jsx
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var MODELS_PATH = path.join(__dirname, "..", "..", "data", "models.json");
function RecommendedModels({ systemData, onBack }) {
  const { exit } = useApp3();
  const [loading, setLoading] = useState3(true);
  const [error, setError] = useState3(null);
  const [flatList, setFlatList] = useState3([]);
  const [selectedIndex, setSelectedIndex] = useState3(0);
  const [actionMessage, setActionMessage] = useState3(null);
  const [showingDetails, setShowingDetails] = useState3(false);
  useEffect2(() => {
    async function fetchRecommendations() {
      try {
        const raw = await fs.readFile(MODELS_PATH, "utf8");
        const models = JSON.parse(raw.replace(/^\uFEFF/, ""));
        const buckets = rankModelsForSystem(systemData, models, "all");
        const list = [];
        buckets.recommended.forEach((item) => list.push({ ...item, group: "recommended" }));
        buckets.mightWork.forEach((item) => list.push({ ...item, group: "mightWork" }));
        buckets.notRecommended.forEach((item) => list.push({ ...item, group: "notRecommended" }));
        setFlatList(list);
        setLoading(false);
      } catch (err) {
        setError(err.message || "Unknown error loading recommendations");
        setLoading(false);
      }
    }
    fetchRecommendations();
  }, [systemData]);
  useInput3((input, key) => {
    if (input === "q") {
      exit();
      return;
    }
    if (key.escape) {
      onBack();
      return;
    }
    if (error || loading) {
      return;
    }
    if (key.upArrow) {
      setSelectedIndex((prev) => Math.max(0, prev - 1));
      setActionMessage(null);
    }
    if (key.downArrow) {
      setSelectedIndex((prev) => Math.min(flatList.length - 1, prev + 1));
      setActionMessage(null);
    }
    if (key.return && flatList.length > 0) {
      setShowingDetails(true);
    }
  }, { isActive: !showingDetails });
  if (showingDetails) {
    return /* @__PURE__ */ React7.createElement(
      ModelDetails,
      {
        modelData: flatList[selectedIndex],
        systemData,
        onBack: () => setShowingDetails(false)
      }
    );
  }
  if (error) {
    return /* @__PURE__ */ React7.createElement(Box7, { flexDirection: "column", width: 56 }, /* @__PURE__ */ React7.createElement(Box7, { borderStyle: "single", borderBottom: false, flexDirection: "column", alignItems: "center", borderColor: "cyan" }, /* @__PURE__ */ React7.createElement(Text7, { bold: true, color: "cyan" }, "RECOMMENDED MODELS")), /* @__PURE__ */ React7.createElement(Box7, { borderStyle: "single", borderTop: false, borderBottom: false, borderColor: "cyan", flexDirection: "column", paddingX: 2, paddingY: 1 }, /* @__PURE__ */ React7.createElement(Text7, { color: "red" }, "Unable to generate recommendations."), /* @__PURE__ */ React7.createElement(Box7, { marginTop: 1 }, /* @__PURE__ */ React7.createElement(Text7, { color: "gray" }, error)), /* @__PURE__ */ React7.createElement(Box7, { marginTop: 1 }, /* @__PURE__ */ React7.createElement(Text7, { color: "gray" }, "Press Esc to return."))), /* @__PURE__ */ React7.createElement(Box7, { borderStyle: "single", borderTop: false, paddingX: 1, borderColor: "cyan" }, /* @__PURE__ */ React7.createElement(Text7, { color: "gray" }, "Esc Back    q Quit")));
  }
  if (loading) {
    return /* @__PURE__ */ React7.createElement(Box7, { flexDirection: "column", width: 56 }, /* @__PURE__ */ React7.createElement(Box7, { borderStyle: "single", borderBottom: false, flexDirection: "column", alignItems: "center", borderColor: "cyan" }, /* @__PURE__ */ React7.createElement(Text7, { bold: true, color: "cyan" }, "RECOMMENDED MODELS")), /* @__PURE__ */ React7.createElement(Box7, { borderStyle: "single", borderTop: false, borderBottom: false, borderColor: "cyan", flexDirection: "column", paddingX: 2, paddingY: 1 }, /* @__PURE__ */ React7.createElement(Text7, { color: "gray" }, "Analyzing your hardware..."), /* @__PURE__ */ React7.createElement(Box7, { marginTop: 1 }, /* @__PURE__ */ React7.createElement(Text7, { color: "blueBright" }, "Loading..."))), /* @__PURE__ */ React7.createElement(Box7, { borderStyle: "single", borderTop: false, paddingX: 1, borderColor: "cyan" }, /* @__PURE__ */ React7.createElement(Text7, { color: "gray" }, "Esc Back    q Quit")));
  }
  const VISIBLE_ITEMS = 8;
  const half = Math.floor(VISIBLE_ITEMS / 2);
  let startIndex = Math.max(0, selectedIndex - half);
  let endIndex = startIndex + VISIBLE_ITEMS;
  if (endIndex > flatList.length) {
    endIndex = flatList.length;
    startIndex = Math.max(0, endIndex - VISIBLE_ITEMS);
  }
  const visibleItems = flatList.slice(startIndex, endIndex);
  const visibleRecommended = visibleItems.filter((i) => i.group === "recommended");
  const visibleMightWork = visibleItems.filter((i) => i.group === "mightWork");
  const visibleNotRecommended = visibleItems.filter((i) => i.group === "notRecommended");
  const renderGroup = (title, items, groupIcon, titleColor) => {
    if (items.length === 0) return null;
    return /* @__PURE__ */ React7.createElement(Box7, { flexDirection: "column", marginBottom: 1 }, /* @__PURE__ */ React7.createElement(Text7, { color: titleColor, bold: true }, groupIcon, " ", title), /* @__PURE__ */ React7.createElement(Text7, { color: "gray" }, "\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500"), /* @__PURE__ */ React7.createElement(Box7, { flexDirection: "column" }, items.map((item) => {
      const index = flatList.findIndex((f) => f.model.name === item.model.name);
      const isSelected = index === selectedIndex;
      return /* @__PURE__ */ React7.createElement(Box7, { key: item.model.name }, /* @__PURE__ */ React7.createElement(Box7, { width: 2 }, /* @__PURE__ */ React7.createElement(Text7, { color: "green" }, isSelected ? "\u276F" : " ")), /* @__PURE__ */ React7.createElement(Box7, { flexGrow: 1 }, /* @__PURE__ */ React7.createElement(Text7, { color: isSelected ? "white" : "gray" }, item.model.display_name)), /* @__PURE__ */ React7.createElement(Box7, null, /* @__PURE__ */ React7.createElement(Text7, { color: isSelected ? "cyan" : "gray" }, item.model.size_billion_params, "B")));
    })));
  };
  return /* @__PURE__ */ React7.createElement(Box7, { flexDirection: "column", width: 56 }, /* @__PURE__ */ React7.createElement(Box7, { borderStyle: "single", borderBottom: false, flexDirection: "column", alignItems: "center", borderColor: "cyan" }, /* @__PURE__ */ React7.createElement(Text7, { bold: true, color: "cyan" }, "RECOMMENDED MODELS")), /* @__PURE__ */ React7.createElement(Box7, { borderStyle: "single", borderTop: false, borderBottom: false, borderColor: "cyan", flexDirection: "column", paddingX: 2, paddingY: 1 }, /* @__PURE__ */ React7.createElement(Box7, { marginBottom: 1 }, /* @__PURE__ */ React7.createElement(Text7, { color: "gray" }, "Based on your system (Showing ", startIndex + 1, "-", endIndex, " of ", flatList.length, ")")), renderGroup("EXCELLENT", visibleRecommended, "\u2713", "green"), renderGroup("GOOD", visibleMightWork, "\u2713", "yellow"), renderGroup("LIMITED", visibleNotRecommended, "\u26A0", "red"), actionMessage && /* @__PURE__ */ React7.createElement(Box7, { marginTop: 1 }, /* @__PURE__ */ React7.createElement(Text7, { color: "yellow" }, actionMessage))), /* @__PURE__ */ React7.createElement(Box7, { borderStyle: "single", borderTop: false, paddingX: 1, borderColor: "cyan" }, /* @__PURE__ */ React7.createElement(Text7, { color: "gray" }, "\u2191\u2193 Navigate   Enter Details   Esc Back   q Quit")));
}

// tui/components/InstalledModels.jsx
import React8, { useState as useState4, useEffect as useEffect3 } from "react";
import { Box as Box8, Text as Text8, useInput as useInput4, useApp as useApp4 } from "ink";

// services/ollamaModels.js
import { execSync as execSync2 } from "node:child_process";
function listInstalledModels() {
  if (!isOllamaInstalled()) {
    throw new Error("Ollama is not installed. Visit https://ollama.com/download");
  }
  let raw;
  try {
    raw = execSync2("ollama list", { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  } catch (err) {
    const message = err.stderr ? err.stderr.toString().trim() : err.message;
    throw new Error(`Ollama is not responding: ${message || "unknown error"}`);
  }
  const lines = raw.trim().split("\n");
  if (lines.length < 2) {
    return [];
  }
  const models = [];
  for (const line of lines.slice(1)) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const cols = trimmed.split(/\s{2,}/);
    if (cols.length < 3) continue;
    const name = cols[0].trim();
    const size = cols[2].trim();
    const modifiedAt = cols[3]?.trim() ?? "";
    if (name) {
      models.push({ name, size, modifiedAt });
    }
  }
  return models;
}

// tui/components/InstalledModels.jsx
function InstalledModels({ onBack }) {
  const { exit } = useApp4();
  const [loading, setLoading] = useState4(true);
  const [error, setError] = useState4(null);
  const [models, setModels] = useState4([]);
  const [selectedIndex, setSelectedIndex] = useState4(0);
  const [infoMessage, setInfoMessage] = useState4(null);
  useEffect3(() => {
    try {
      const installed = listInstalledModels();
      setModels(installed);
    } catch (err) {
      setError(err.message || "Unknown error querying Ollama");
    } finally {
      setLoading(false);
    }
  }, []);
  useInput4((input, key) => {
    if (input === "q") {
      exit();
      return;
    }
    if (key.escape) {
      onBack();
      return;
    }
    if (loading || error || models.length === 0) return;
    if (key.upArrow) {
      setSelectedIndex((prev) => Math.max(0, prev - 1));
      setInfoMessage(null);
    }
    if (key.downArrow) {
      setSelectedIndex((prev) => Math.min(models.length - 1, prev + 1));
      setInfoMessage(null);
    }
    if (key.return) {
      setInfoMessage("Installed model details will be expanded in a future phase.");
    }
  });
  const VISIBLE = 10;
  const half = Math.floor(VISIBLE / 2);
  let startIdx = Math.max(0, selectedIndex - half);
  let endIdx = startIdx + VISIBLE;
  if (endIdx > models.length) {
    endIdx = models.length;
    startIdx = Math.max(0, endIdx - VISIBLE);
  }
  const visibleModels = models.slice(startIdx, endIdx);
  const renderBody = () => {
    if (loading) {
      return /* @__PURE__ */ React8.createElement(Text8, { color: "gray" }, "Loading installed models...");
    }
    if (error) {
      return /* @__PURE__ */ React8.createElement(Box8, { flexDirection: "column" }, /* @__PURE__ */ React8.createElement(Text8, { color: "red" }, "Ollama is not available."), /* @__PURE__ */ React8.createElement(Box8, { marginTop: 1 }, /* @__PURE__ */ React8.createElement(Text8, { color: "gray" }, error)));
    }
    if (models.length === 0) {
      return /* @__PURE__ */ React8.createElement(Box8, { flexDirection: "column" }, /* @__PURE__ */ React8.createElement(Text8, { color: "gray" }, "No models installed."), /* @__PURE__ */ React8.createElement(Box8, { marginTop: 1 }, /* @__PURE__ */ React8.createElement(Text8, { color: "gray" }, "Use  llm-fit recommend  to find compatible models.")));
    }
    return /* @__PURE__ */ React8.createElement(Box8, { flexDirection: "column" }, /* @__PURE__ */ React8.createElement(Box8, { marginBottom: 1 }, /* @__PURE__ */ React8.createElement(Text8, { bold: true, color: "blueBright" }, "Ollama Models"), /* @__PURE__ */ React8.createElement(Text8, { color: "gray" }, "  (", models.length, " total)")), models.length > VISIBLE && /* @__PURE__ */ React8.createElement(Box8, { marginBottom: 1 }, /* @__PURE__ */ React8.createElement(Text8, { color: "gray" }, "Showing ", startIdx + 1, "\u2013", endIdx, " of ", models.length)), /* @__PURE__ */ React8.createElement(Box8, { flexDirection: "column" }, visibleModels.map((m, i) => {
      const realIdx = startIdx + i;
      const isSelected = realIdx === selectedIndex;
      return /* @__PURE__ */ React8.createElement(Box8, { key: m.name }, /* @__PURE__ */ React8.createElement(Box8, { width: 2 }, /* @__PURE__ */ React8.createElement(Text8, { color: "green" }, isSelected ? "\u276F" : " ")), /* @__PURE__ */ React8.createElement(Box8, { width: 2 }, /* @__PURE__ */ React8.createElement(Text8, { color: "green" }, "\u2713")), /* @__PURE__ */ React8.createElement(Box8, { flexGrow: 1 }, /* @__PURE__ */ React8.createElement(Text8, { color: isSelected ? "white" : "gray" }, m.name)), m.size ? /* @__PURE__ */ React8.createElement(Box8, { width: 8, justifyContent: "flex-end" }, /* @__PURE__ */ React8.createElement(Text8, { color: isSelected ? "cyan" : "gray" }, m.size)) : null);
    })), infoMessage && /* @__PURE__ */ React8.createElement(Box8, { marginTop: 1 }, /* @__PURE__ */ React8.createElement(Text8, { color: "yellow" }, infoMessage)));
  };
  return /* @__PURE__ */ React8.createElement(Box8, { flexDirection: "column", width: 56 }, /* @__PURE__ */ React8.createElement(
    Box8,
    {
      borderStyle: "single",
      borderBottom: false,
      flexDirection: "column",
      alignItems: "center",
      borderColor: "cyan"
    },
    /* @__PURE__ */ React8.createElement(Text8, { bold: true, color: "cyan" }, "INSTALLED MODELS")
  ), /* @__PURE__ */ React8.createElement(
    Box8,
    {
      borderStyle: "single",
      borderTop: false,
      borderBottom: false,
      borderColor: "cyan",
      flexDirection: "column",
      paddingX: 2,
      paddingY: 1
    },
    renderBody()
  ), /* @__PURE__ */ React8.createElement(Box8, { borderStyle: "single", borderTop: false, paddingX: 1, borderColor: "cyan" }, /* @__PURE__ */ React8.createElement(Text8, { color: "gray" }, "\u2191\u2193 Navigate   Enter Select   Esc Back   q Quit")));
}

// services/systemScanner.js
import { promises as fs2 } from "node:fs";
import si from "systeminformation";
function toRoundedGbFromBytes(valueInBytes) {
  if (valueInBytes === null || valueInBytes === void 0) {
    return null;
  }
  const raw = Number(valueInBytes);
  if (!Number.isFinite(raw) || raw <= 0) {
    return null;
  }
  const gb = raw / 1024 ** 3;
  return Math.max(1, Math.round(gb));
}
function toRoundedGbFromMb(valueInMb) {
  if (valueInMb === null || valueInMb === void 0) {
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
  const text = `${controller.vendor || ""} ${controller.model}`.toLowerCase();
  if (!text.trim()) {
    return false;
  }
  const integratedHints = [
    "intel",
    "integrated",
    "uhd",
    "iris",
    "vega 3",
    "virtual",
    "microsoft basic"
  ];
  return !integratedHints.some((hint) => text.includes(hint));
}
async function detectWSL() {
  if (process.platform !== "linux") {
    return false;
  }
  try {
    const procVersion = await fs2.readFile("/proc/version", "utf8");
    return procVersion.toLowerCase().includes("microsoft");
  } catch {
    return false;
  }
}
async function scanSystemHardware() {
  const [memInfo, cpuInfo, osInfo, graphicsInfo, isWSL] = await Promise.all([
    si.mem().catch(() => ({ total: 0 })),
    si.cpu().catch(() => ({ brand: "Unknown CPU", physicalCores: 0, speed: 0 })),
    si.osInfo().catch(() => ({ distro: process.platform, release: "" })),
    si.graphics().catch(() => ({ controllers: [] })),
    detectWSL()
  ]);
  const controllers = Array.isArray(graphicsInfo.controllers) ? graphicsInfo.controllers : [];
  const discrete = controllers.find(hasDiscreteGpuController);
  const fallback = controllers[0];
  const gpuModel = discrete?.model || fallback?.model || "Integrated / Unknown";
  const gpuVramGb = toRoundedGbFromMb(discrete?.vram ?? fallback?.vram);
  const osName = [osInfo.distro, osInfo.release].filter(Boolean).join(" ").trim();
  return {
    ram: toRoundedGbFromBytes(memInfo.total) || 0,
    cpu: {
      brand: cpuInfo.brand || "Unknown CPU",
      cores: cpuInfo.physicalCores || cpuInfo.cores || 0,
      speed: Number(cpuInfo.speed) || 0
    },
    gpu: {
      model: discrete ? gpuModel : "Integrated / Unknown",
      vram: discrete ? gpuVramGb : null
    },
    os: osName || process.platform,
    isWSL
  };
}

// tui/App.jsx
function App() {
  const { exit } = useApp5();
  const [currentView, setCurrentView] = useState5("dashboard");
  const [selectedIndex, setSelectedIndex] = useState5(0);
  const [actionMessage, setActionMessage] = useState5(null);
  const [systemData, setSystemData] = useState5(null);
  const [scanError, setScanError] = useState5(null);
  const actions = [
    "Recommended Models",
    "Browse Models",
    "Installed Models",
    "System Information"
  ];
  useEffect4(() => {
    scanSystemHardware().then((data) => {
      setSystemData(data);
    }).catch((err) => {
      setScanError(err.message || "Unknown scanning error");
    });
  }, []);
  useInput5((input, key) => {
    if (input === "q" || key.escape) {
      exit();
      return;
    }
    if (key.upArrow) {
      setSelectedIndex((prev) => Math.max(0, prev - 1));
      setActionMessage(null);
    }
    if (key.downArrow) {
      setSelectedIndex((prev) => Math.min(actions.length - 1, prev + 1));
      setActionMessage(null);
    }
    if (key.return) {
      if (selectedIndex === 0) {
        setCurrentView("recommended");
      } else if (selectedIndex === 2) {
        setCurrentView("installed");
      } else {
        setActionMessage(`${actions[selectedIndex]} \u2014 coming soon`);
      }
    }
  }, { isActive: currentView === "dashboard" });
  if (currentView === "recommended") {
    return /* @__PURE__ */ React9.createElement(RecommendedModels, { systemData, onBack: () => setCurrentView("dashboard") });
  }
  if (currentView === "installed") {
    return /* @__PURE__ */ React9.createElement(InstalledModels, { onBack: () => setCurrentView("dashboard") });
  }
  return /* @__PURE__ */ React9.createElement(Box9, { flexDirection: "column", width: 56 }, /* @__PURE__ */ React9.createElement(Header, null), /* @__PURE__ */ React9.createElement(
    Box9,
    {
      borderStyle: "single",
      borderBottom: false,
      borderTop: false,
      borderColor: "cyan",
      flexDirection: "column",
      paddingX: 2,
      paddingY: 1
    },
    /* @__PURE__ */ React9.createElement(Text9, { bold: true }, "Dashboard"),
    /* @__PURE__ */ React9.createElement(SystemCard, { data: systemData, error: scanError }),
    /* @__PURE__ */ React9.createElement(Box9, { marginTop: 1 }, /* @__PURE__ */ React9.createElement(
      QuickActions,
      {
        actions,
        selectedIndex,
        actionMessage
      }
    ))
  ), /* @__PURE__ */ React9.createElement(Footer, null));
}

// tui/index.jsx
render(/* @__PURE__ */ React10.createElement(App, null));
