import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { WHISPER_MODEL, type WhisperProgress } from "./types";

type Transcriber = (audio: Float32Array) => Promise<{ text?: string } | string>;

let transcriber: Transcriber | null = null;
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

export async function ensureWhisper(): Promise<Transcriber> {
  if (transcriber) return transcriber;
  if (loading) return loading;

  loading = (async () => {
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

    const loaded = (await pipeline("automatic-speech-recognition", WHISPER_MODEL, {
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
