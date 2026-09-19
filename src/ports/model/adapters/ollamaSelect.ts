import { totalmem } from "node:os";

const GB = 1024 * 1024 * 1024;
export const OLLAMA_HEADROOM_BYTES = 16 * GB;

export function comfortHeadroomBytes(totalMemoryBytes: number): number {
  const gb = totalMemoryBytes / GB;
  if (gb < 9) return 5 * GB;
  if (gb < 13) return 5.5 * GB;
  if (gb < 20) return 8 * GB;
  if (gb < 28) return 9 * GB;
  if (gb < 40) return 12 * GB;
  if (gb < 56) return 14 * GB;
  return OLLAMA_HEADROOM_BYTES;
}

export type ListedOllamaModel = {
  name: string;
  size: number;
  parameterSize: string;
  quantization: string;
  capabilities: string[];
};

export function parseParameterBillions(raw: string): number {
  const match = /([\d.]+)\s*([MB])/i.exec(raw.trim());
  if (!match) return 0;
  const value = Number(match[1]);
  if (!Number.isFinite(value)) return 0;
  return match[2].toUpperCase() === "M" ? value / 1000 : value;
}

export function quantScore(raw: string): number {
  const q = raw.toUpperCase();
  if (q.includes("Q8") || q.includes("FP16") || q.includes("BF16") || q.includes("F16")) {
    return 1;
  }
  if (q.includes("Q6")) return 0.9;
  if (q.includes("Q5")) return 0.85;
  if (q.includes("Q4")) return 0.75;
  if (q.includes("Q3")) return 0.6;
  return 0.7;
}

export function isChatCapable(model: ListedOllamaModel): boolean {
  const caps = model.capabilities;
  if (caps.includes("embedding") && !caps.includes("completion")) return false;
  return caps.length === 0 || caps.includes("completion");
}

export function fitsComfortably(
  sizeBytes: number,
  totalMemoryBytes: number,
  headroomBytes = comfortHeadroomBytes(totalMemoryBytes),
): boolean {
  return sizeBytes > 0 && sizeBytes + headroomBytes <= totalMemoryBytes;
}

export function scoreChatModel(model: ListedOllamaModel): number {
  const instruct = /(^|[:\-_])(it|instruct|chat)([:\-_]|$)/i.test(model.name)
    ? 1.15
    : 1;
  return parseParameterBillions(model.parameterSize) * quantScore(model.quantization) * instruct;
}

export function pickComfortableModel(
  models: ListedOllamaModel[],
  totalMemoryBytes: number,
  wanted?: string | null,
): ListedOllamaModel | null {
  const chat = models.filter(isChatCapable);
  if (wanted) {
    const exact = chat.find(
      (model) =>
        model.name === wanted ||
        model.name === `${wanted}:latest` ||
        model.name.split(":")[0] === wanted,
    );
    if (exact) return exact;
  }
  const fitting = chat.filter((model) =>
    fitsComfortably(model.size, totalMemoryBytes),
  );
  if (fitting.length === 0) return null;
  return [...fitting].sort((a, b) => scoreChatModel(b) - scoreChatModel(a))[0] ?? null;
}

export function systemMemoryBytes(): number {
  return totalmem();
}

export function envWantedModel(): string | null {
  const raw = (process.env.OLLAMA_MODEL ?? "").trim();
  if (!raw || raw.toLowerCase() === "auto") return null;
  return raw;
}

export function envWantedCallModel(): string | null {
  const raw = (process.env.OLLAMA_CALL_MODEL ?? "").trim();
  if (!raw || raw.toLowerCase() === "auto") return null;
  return raw;
}

export function pickFastCallModel(
  models: ListedOllamaModel[],
  totalMemoryBytes: number,
  wanted?: string | null,
): ListedOllamaModel | null {
  const chat = models.filter(isChatCapable);
  if (wanted) {
    const exact = chat.find(
      (model) =>
        model.name === wanted ||
        model.name === `${wanted}:latest` ||
        model.name.split(":")[0] === wanted,
    );
    if (exact) return exact;
  }
  const small = chat.filter((model) => {
    const billions = parseParameterBillions(model.parameterSize);
    return billions >= 1 && billions <= 8 && fitsComfortably(model.size, totalMemoryBytes);
  });
  if (small.length === 0) return null;
  return [...small].sort((a, b) => {
    const instruct = (model: ListedOllamaModel) =>
      /(^|[:\-_])(it|instruct|chat)([:\-_]|$)/i.test(model.name) ? 1 : 0;
    if (instruct(b) !== instruct(a)) return instruct(b) - instruct(a);
    return a.size - b.size;
  })[0] ?? null;
}

export function pickCallModel(
  models: ListedOllamaModel[],
  totalMemoryBytes: number,
  wanted?: string | null,
): ListedOllamaModel | null {
  return (
    pickFastCallModel(models, totalMemoryBytes, wanted) ??
    pickComfortableModel(models, totalMemoryBytes, wanted)
  );
}
