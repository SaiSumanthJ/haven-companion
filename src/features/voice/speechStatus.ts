export type WhisperProgress = {
  status: "idle" | "downloading" | "ready" | "error";
  percent: number;
  detail: string;
};

const idle: WhisperProgress = {
  status: "idle",
  percent: 0,
  detail: "Voice model is not loaded yet.",
};

export async function fetchSpeechStatus(): Promise<WhisperProgress> {
  const response = await fetch("/api/speech", { cache: "no-store" });
  if (!response.ok) {
    return {
      status: "error",
      percent: 0,
      detail: "The voice model could not start. Stay on this page, then try Voice again.",
    };
  }
  const body = (await response.json()) as Partial<WhisperProgress>;
  return {
    status: body.status ?? idle.status,
    percent: typeof body.percent === "number" ? body.percent : 0,
    detail: body.detail ?? idle.detail,
  };
}

export async function fetchSpeakStatus(): Promise<WhisperProgress> {
  const response = await fetch("/api/speak", { cache: "no-store" });
  if (!response.ok) {
    return {
      status: "error",
      percent: 0,
      detail: "The spoken voice could not start. Stay on this page, then try Call again.",
    };
  }
  const body = (await response.json()) as Partial<WhisperProgress>;
  return {
    status: body.status ?? idle.status,
    percent: typeof body.percent === "number" ? body.percent : 0,
    detail: body.detail ?? "Spoken voice model is not loaded yet.",
  };
}

export async function transcribeLocal(samples: Float32Array): Promise<string> {
  const bytes = new Uint8Array(samples.byteLength);
  bytes.set(new Uint8Array(samples.buffer, samples.byteOffset, samples.byteLength));
  const response = await fetch("/api/speech", {
    method: "POST",
    headers: { "Content-Type": "application/octet-stream" },
    body: bytes,
  });
  const body = (await response.json()) as { text?: string; error?: string };
  if (!response.ok) {
    throw new Error(body.error || "The on-device voice model could not read that.");
  }
  return (body.text ?? "").trim();
}
