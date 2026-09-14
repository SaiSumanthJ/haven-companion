import { rateValue, KOKORO_VOICES, type CallPrefs, type VoiceChoice } from "@/features/voice/callSpeech";

let context: AudioContext | null = null;
let current: AudioBufferSourceNode | null = null;
let playing: (() => void) | null = null;

function audioContext(): AudioContext {
  if (!context) context = new AudioContext();
  return context;
}

export function canSpeakLocally(): boolean {
  return typeof window !== "undefined" && typeof AudioContext !== "undefined";
}

export function listLocalVoices(): VoiceChoice[] {
  return KOKORO_VOICES;
}

export function unlockLocalSpeech() {
  if (!canSpeakLocally()) return;
  void audioContext().resume();
}

export function stopLocalSpeech() {
  try {
    current?.stop();
  } catch {
    /* already stopped */
  }
  current = null;
  playing?.();
  playing = null;
}

export async function prepareLocalSpeech(text: string, prefs: CallPrefs): Promise<AudioBuffer> {
  if (!canSpeakLocally()) {
    throw new Error("This browser cannot play a spoken voice.");
  }
  const response = await fetch("/api/speak", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text,
      voice: prefs.voiceURI || "af_heart",
      rate: prefs.rate,
    }),
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error || "The spoken voice could not finish that line.");
  }
  const ctx = audioContext();
  await ctx.resume();
  return ctx.decodeAudioData(await response.arrayBuffer());
}

export async function playLocalBuffer(buffer: AudioBuffer, prefs: CallPrefs): Promise<void> {
  if (!canSpeakLocally()) {
    throw new Error("This browser cannot play a spoken voice.");
  }
  unlockLocalSpeech();
  const ctx = audioContext();
  await ctx.resume();
  await new Promise<void>((resolve, reject) => {
    const source = ctx.createBufferSource();
    current = source;
    playing = () => resolve();
    source.buffer = buffer;
    source.playbackRate.value = rateValue(prefs.rate);
    source.connect(ctx.destination);
    source.onended = () => {
      if (current === source) current = null;
      playing = null;
      resolve();
    };
    try {
      source.start();
    } catch (error) {
      current = null;
      playing = null;
      reject(error instanceof Error ? error : new Error("The spoken voice could not start."));
    }
  });
}

export async function speakLocal(
  text: string,
  prefs: CallPrefs,
  options?: { interrupt?: boolean },
): Promise<void> {
  if (options?.interrupt !== false) stopLocalSpeech();
  const buffer = await prepareLocalSpeech(text, prefs);
  await playLocalBuffer(buffer, prefs);
}
