import { KokoroTTS } from "kokoro-js";

const MODEL = "onnx-community/Kokoro-82M-v1.0-ONNX";
const SPEEDS = { slow: 0.96, natural: 0.96, fast: 0.96 };
const DEFAULT_VOICE = "af_heart";

function encodeWav(samples, sampleRate) {
  const bytes = new Uint8Array(44 + samples.length * 2);
  const view = new DataView(bytes.buffer);
  function text(at, value) {
    for (let i = 0; i < value.length; i += 1) view.setUint8(at + i, value.charCodeAt(i));
  }
  text(0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  text(8, "WAVE");
  text(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  text(36, "data");
  view.setUint32(40, samples.length * 2, true);
  let cursor = 44;
  for (const sample of samples) {
    const clipped = Math.max(-1, Math.min(1, sample));
    view.setInt16(cursor, clipped < 0 ? clipped * 0x8000 : clipped * 0x7fff, true);
    cursor += 2;
  }
  return bytes;
}

function concat(parts) {
  const total = parts.reduce((sum, part) => sum + part.length, 0);
  const out = new Float32Array(total);
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
}

function chunks(text) {
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
  const out = [];
  let packed = "";
  for (const sentence of sentences) {
    const next = packed ? `${packed} ${sentence}` : sentence;
    if (next.length > 220 && packed) {
      out.push(packed);
      packed = sentence;
    } else packed = next;
  }
  if (packed) out.push(packed);
  return out;
}

function send(message) {
  if (typeof process.send === "function") process.send(message);
}

let speaker = null;

async function speak(text, voice, rate) {
  const parts = [];
  let sampleRate = 24000;
  const pieces = chunks(text);
  if (pieces.length === 0) return encodeWav(new Float32Array(0), sampleRate);
  for (const piece of pieces) {
    const audio = await speaker.generate(piece, {
      voice: voice || DEFAULT_VOICE,
      speed: SPEEDS[rate] ?? SPEEDS.natural,
    });
    if (audio.audio) parts.push(audio.audio);
    if (audio.sampling_rate) sampleRate = audio.sampling_rate;
    parts.push(new Float32Array(Math.round(sampleRate * 0.05)));
  }
  return encodeWav(concat(parts), sampleRate);
}

process.on("message", async (message) => {
  if (!message || message.type !== "speak") return;
  try {
    if (!speaker) throw new Error("Spoken voice is still loading.");
    const wav = await speak(message.text, message.voice, message.rate);
    send({ type: "wav", id: message.id, wav: Buffer.from(wav).toString("base64") });
  } catch (error) {
    send({
      type: "error",
      id: message.id,
      error: error instanceof Error ? error.message : "The spoken voice could not finish that line.",
    });
  }
});

try {
  send({ type: "progress", percent: 1, detail: "Preparing a clean spoken voice on this computer…" });
  speaker = await KokoroTTS.from_pretrained(MODEL, {
    dtype: "q8",
    device: "cpu",
    progress_callback: (event) => {
      const info = event ?? {};
      const ratio =
        typeof info.loaded === "number" && typeof info.total === "number" && info.total > 0
          ? info.loaded / info.total
          : typeof info.progress === "number"
            ? info.progress / 100
            : 0;
      if (ratio <= 0) return;
      const percent = Math.min(99, Math.round(ratio * 100));
      send({
        type: "progress",
        percent,
        detail:
          percent >= 95
            ? "Preparing the spoken voice…"
            : `Downloading spoken voice… ${percent}%`,
      });
    },
  });
  send({ type: "ready" });
} catch (error) {
  send({
    type: "boot-error",
    error: error instanceof Error ? error.message : "The spoken voice could not download.",
  });
  process.exit(1);
}
