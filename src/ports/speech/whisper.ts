import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { selectedWhisperId } from "./whisperOffers";
import { WHISPER_MODEL, type WhisperProgress } from "./types";

type Transcriber = (audio: Float32Array) => Promise<{ text?: string } | string>;

let transcriber: Transcriber | null = null;
let loadedId = "";
let loading: Promise<Transcriber> | null = null;
const listeners = new Set<(progress: WhisperProgress) => void>();
let progress: WhisperProgress = {
  status: "idle",
  percent: 0,
  detail: "Voice model is not loaded yet.",
};

function emit(next: WhisperProgress) {
  progress = next;
  for (const listener of listeners) listener(next);
}

function cacheDir() {
  return join(process.cwd(), ".haven", "whisper");
}

export function whisperProgress(): WhisperProgress {
  return progress;
}

export function onWhisperProgress(listener: (next: WhisperProgress) => void): () => void {
  listeners.add(listener);
  listener(progress);
  return () => {
    listeners.delete(listener);
  };
}

export function resetWhisper(): void {
  transcriber = null;
  loadedId = "";
  loading = null;
  emit({
    status: "idle",
    percent: 0,
    detail: "Voice model will load on the next take.",
  });
}

export async function ensureWhisper(): Promise<Transcriber> {
  const wanted = selectedWhisperId();
  if (transcriber && loadedId === wanted) return transcriber;
  if (loading && loadedId === wanted) return loading;
  transcriber = null;

  loading = (async () => {
    loadedId = wanted;
    emit({
      status: "downloading",
      percent: 1,
      detail: "Downloading the free voice model onto this computer (once)…",
    });
    mkdirSync(cacheDir(), { recursive: true });
    const { env, pipeline } = await import("@huggingface/transformers");
    env.allowRemoteModels = true;
    env.allowLocalModels = true;
    env.useFSCache = true;
    env.cacheDir = cacheDir();

    const loaded = (await pipeline("automatic-speech-recognition", wanted, {
      progress_callback: (event: {
        status?: string;
        progress?: number;
        loaded?: number;
        total?: number;
      }) => {
        const ratio =
          typeof event.loaded === "number" && typeof event.total === "number" && event.total > 0
            ? event.loaded / event.total
            : typeof event.progress === "number"
              ? event.progress / 100
              : 0;
        if (ratio <= 0) return;
        const percent = Math.min(99, Math.round(ratio * 100));
        emit({
          status: "downloading",
          percent: Math.max(progress.percent, percent),
          detail:
            percent >= 95
              ? "Preparing the voice model…"
              : `Downloading voice model… ${Math.max(progress.percent, percent)}%`,
        });
      },
    })) as Transcriber;

    transcriber = loaded;
    loadedId = wanted;
    emit({
      status: "ready",
      percent: 100,
      detail: "Voice is ready.",
    });
    return loaded;
  })().catch((error: unknown) => {
    loading = null;
    emit({
      status: "error",
      percent: 0,
      detail:
        error instanceof Error
          ? error.message
          : "The voice model could not download.",
    });
    throw error;
  });

  return loading;
}

export async function transcribeSamples(samples: Float32Array): Promise<string> {
  const model = await ensureWhisper();
  const result = await model(samples);
  const text = typeof result === "string" ? result : result.text ?? "";
  return text.trim();
}

export { WHISPER_MODEL };
export type { WhisperProgress };
