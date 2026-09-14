import { randomUUID } from "node:crypto";
import type { ChildProcess } from "node:child_process";
import { spawnKokoroWorker, type WorkerEvent } from "./kokoroProcess";
import { KOKORO_MODEL, type SpeakProgress } from "./types";

type SpeakJob = {
  resolve: (wav: Uint8Array) => void;
  reject: (error: Error) => void;
};

let worker: ChildProcess | null = null;
let loading: Promise<void> | null = null;
const jobs = new Map<string, SpeakJob>();
const listeners = new Set<(progress: SpeakProgress) => void>();
let progress: SpeakProgress = {
  status: "idle",
  percent: 0,
  detail: "Spoken voice model is not loaded yet.",
};

function emit(next: SpeakProgress) {
  progress = next;
  for (const listener of listeners) listener(next);
}

function failJobs(error: Error) {
  for (const job of jobs.values()) job.reject(error);
  jobs.clear();
}

function handleEvent(message: WorkerEvent) {
  if (message.type === "progress") {
    emit({
      status: "downloading",
      percent: Math.max(progress.percent, message.percent ?? 1),
      detail: message.detail || "Preparing a clean spoken voice…",
    });
    return;
  }
  if (message.type === "ready") {
    emit({ status: "ready", percent: 100, detail: "Spoken voice is ready." });
    return;
  }
  if (message.type === "boot-error") {
    emit({
      status: "error",
      percent: 0,
      detail: message.error || "The spoken voice could not download.",
    });
    return;
  }
  if (!message.id) return;
  const job = jobs.get(message.id);
  if (!job) return;
  jobs.delete(message.id);
  if (message.type === "wav" && message.wav) {
    job.resolve(Uint8Array.from(Buffer.from(message.wav, "base64")));
    return;
  }
  job.reject(new Error(message.error || "The spoken voice could not finish that line."));
}

function startWorker(): Promise<void> {
  return new Promise((resolve, reject) => {
    emit({
      status: "downloading",
      percent: 1,
      detail: "Downloading a clean spoken voice onto this computer (once)…",
    });
    const child = spawnKokoroWorker(handleEvent, () => {
      worker = null;
      loading = null;
      if (progress.status !== "error") {
        emit({
          status: "error",
          percent: 0,
          detail: "The spoken voice stopped. Call again and it will reload.",
        });
      }
      failJobs(new Error("The spoken voice stopped before it finished."));
    });
    worker = child;
    const onMessage = (raw: unknown) => {
      const message = raw as WorkerEvent;
      if (message.type === "ready") {
        child.off("message", onMessage);
        resolve();
      }
      if (message.type === "boot-error") {
        child.off("message", onMessage);
        reject(new Error(message.error || "The spoken voice could not download."));
      }
    };
    child.on("message", onMessage);
    child.on("error", (error) => {
      worker = null;
      loading = null;
      reject(error);
    });
  });
}

export function speakProgress(): SpeakProgress {
  return progress;
}

export async function ensureKokoro(): Promise<void> {
  if (worker?.connected && progress.status === "ready") return;
  if (loading) return loading;
  loading = startWorker().catch((error: unknown) => {
    loading = null;
    worker = null;
    emit({
      status: "error",
      percent: 0,
      detail: error instanceof Error ? error.message : "The spoken voice could not download.",
    });
    throw error;
  });
  return loading;
}

export async function speakToWav(
  text: string,
  voice: string,
  rate: "slow" | "natural" | "fast",
): Promise<Uint8Array> {
  await ensureKokoro();
  if (!worker?.connected) throw new Error("The spoken voice is not ready.");
  return new Promise((resolve, reject) => {
    const id = randomUUID();
    const timer = setTimeout(() => {
      jobs.delete(id);
      reject(new Error("The spoken voice took too long."));
    }, 60000);
    jobs.set(id, {
      resolve: (wav) => {
        clearTimeout(timer);
        resolve(wav);
      },
      reject: (error) => {
        clearTimeout(timer);
        reject(error);
      },
    });
    worker?.send({ type: "speak", id, text, voice, rate });
  });
}

export { KOKORO_MODEL };
