import type { CompanionModel } from "../types";
import { createOllamaModel, OLLAMA_HOST } from "./ollama";
import { readLocalPrefs } from "@/ports/localPrefs";
import {
  envWantedCallModel,
  envWantedModel,
  pickComfortableModel,
  pickFastCallModel,
  systemMemoryBytes,
  type ListedOllamaModel,
} from "./ollamaSelect";

export async function listInstalled(): Promise<ListedOllamaModel[]> {
  const response = await fetch(`${OLLAMA_HOST}/api/tags`, {
    signal: AbortSignal.timeout(2000),
  });
  if (!response.ok) return [];
  const payload = (await response.json()) as {
    models?: Array<{
      name?: string;
      size?: number;
      details?: { parameter_size?: string; quantization_level?: string };
      capabilities?: string[];
    }>;
  };
  return (payload.models ?? []).map((entry) => ({
    name: entry.name ?? "",
    size: entry.size ?? 0,
    parameterSize: entry.details?.parameter_size ?? "",
    quantization: entry.details?.quantization_level ?? "",
    capabilities: entry.capabilities ?? [],
  }));
}

export async function resolveOllamaModel(): Promise<CompanionModel | null> {
  try {
    const picked = pickComfortableModel(
      await listInstalled(),
      systemMemoryBytes(),
      readLocalPrefs().chatModel ?? envWantedModel(),
    );
    if (!picked) return null;
    return createOllamaModel(picked.name);
  } catch {
    return null;
  }
}

export async function resolveOllamaCallModel(): Promise<CompanionModel | null> {
  try {
    const installed = await listInstalled();
    const ram = systemMemoryBytes();
    const fast = pickFastCallModel(
      installed,
      ram,
      readLocalPrefs().callModel ?? envWantedCallModel(),
    );
    if (fast) return createOllamaModel(fast.name);
    return resolveOllamaModel();
  } catch {
    return null;
  }
}

let warming = false;

export function startOllamaWarm(nameFromLabel: string): void {
  const name = nameFromLabel.replace(/^Ollama · /, "");
  if (!name || warming) return;
  warming = true;
  void fetch(`${OLLAMA_HOST}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: name,
      stream: false,
      think: false,
      keep_alive: "30m",
      options: { num_ctx: 512, num_predict: 1 },
      messages: [{ role: "user", content: "hi" }],
    }),
  }).catch(() => undefined);
}

export async function isOllamaReady(): Promise<boolean> {
  return (await resolveOllamaModel()) !== null;
}
