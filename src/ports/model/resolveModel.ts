import { mockModel } from "./adapters/mock";
import { resolveOllamaCallModel, resolveOllamaModel, startOllamaWarm } from "./adapters/ollama";
import { openrouterModel } from "./adapters/openrouter";
import type { CompanionModel, ModelAdapterId, ModelHealth, TalkPace } from "./types";

function forcedAdapter(): ModelAdapterId | "auto" {
  const raw = (process.env.HAVEN_MODEL_ADAPTER ?? "auto").toLowerCase();
  if (raw === "mock" || raw === "ollama" || raw === "openrouter") {
    return raw;
  }
  return "auto";
}

let cached: CompanionModel | null = null;
let cachedCall: CompanionModel | null = null;

export function forgetResolvedModels(): void {
  cached = null;
  cachedCall = null;
}

export async function resolveModel(pace: TalkPace = "chat"): Promise<CompanionModel> {
  if (pace === "call") {
    if (cachedCall) return cachedCall;
    const forced = forcedAdapter();
    if (forced === "mock") {
      cachedCall = mockModel;
      return cachedCall;
    }
    if (forced !== "openrouter") {
      const call = await resolveOllamaCallModel();
      if (call) {
        startOllamaWarm(call.label);
        cachedCall = call;
        return cachedCall;
      }
    }
    cachedCall = await resolveModel("chat");
    return cachedCall;
  }
  if (cached) return cached;
  const forced = forcedAdapter();
  if (forced === "mock") {
    cached = mockModel;
    return cached;
  }
  if (forced === "openrouter") {
    cached = openrouterModel;
    return cached;
  }

  const ollama = await resolveOllamaModel();
  if (ollama) {
    startOllamaWarm(ollama.label);
    cached = ollama;
    return cached;
  }
  if (forced === "ollama") {
    cached = mockModel;
    return cached;
  }
  if (process.env.OPENROUTER_API_KEY) {
    cached = openrouterModel;
    return cached;
  }
  cached = mockModel;
  return cached;
}

export async function getModelHealth(): Promise<ModelHealth> {
  const model = await resolveModel();
  if (model.id === "mock") {
    return {
      adapter: "mock",
      label: model.label,
      ready: true,
      detail:
        "Demo replies only. In a terminal in this folder run npm run setup, install the model it names, keep Ollama open, then refresh this page. Memory still saves.",
    };
  }
  if (model.id === "ollama") {
    return {
      adapter: "ollama",
      label: model.label,
      ready: true,
      detail:
        "Local model on this computer. First reply can take a minute while it wakes.",
    };
  }
  return {
    adapter: model.id,
    label: model.label,
    ready: true,
    detail: "Live model connected through the Haven model port.",
  };
}
