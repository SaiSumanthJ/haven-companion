export type CallRate = "slow" | "natural" | "fast";

export type CallPrefs = {
  voiceURI: string;
  rate: CallRate;
  listenAgain: boolean;
};

export type VoiceChoice = {
  voiceURI: string;
  name: string;
  lang: string;
  localService: boolean;
};

export const CALL_RATES: Array<{ id: CallRate; label: string; value: number }> = [
  { id: "slow", label: "Slow", value: 0.84 },
  { id: "natural", label: "Natural", value: 1 },
  { id: "fast", label: "Fast", value: 1.16 },
];

export const KOKORO_VOICES: VoiceChoice[] = [
  { voiceURI: "af_heart", name: "Heart · warm", lang: "en-US", localService: true },
  { voiceURI: "af_bella", name: "Bella · clear", lang: "en-US", localService: true },
  { voiceURI: "af_nicole", name: "Nicole · soft", lang: "en-US", localService: true },
  { voiceURI: "af_sarah", name: "Sarah · calm", lang: "en-US", localService: true },
  { voiceURI: "am_michael", name: "Michael · warm", lang: "en-US", localService: true },
  { voiceURI: "am_fenrir", name: "Fenrir · steady", lang: "en-US", localService: true },
  { voiceURI: "bf_emma", name: "Emma · UK", lang: "en-GB", localService: true },
  { voiceURI: "bm_george", name: "George · UK", lang: "en-GB", localService: true },
];

export const emptyCallPrefs = (): CallPrefs => ({
  voiceURI: "af_heart",
  rate: "natural",
  listenAgain: true,
});

export function rateValue(rate: CallRate): number {
  return CALL_RATES.find((item) => item.id === rate)?.value ?? 1;
}

export function pickLocalVoices(voices: VoiceChoice[]): VoiceChoice[] {
  return voices.filter(
    (voice) =>
      voice.localService &&
      !/google|network|remote|online/i.test(`${voice.name} ${voice.voiceURI}`),
  );
}

export function preferEnglish(voices: VoiceChoice[]): VoiceChoice[] {
  const english = voices.filter((voice) => /^en\b/i.test(voice.lang));
  return english.length > 0 ? english : voices;
}

export function resolveVoiceURI(voices: VoiceChoice[], wanted: string): string {
  if (voices.some((voice) => voice.voiceURI === wanted)) return wanted;
  return preferEnglish(voices)[0]?.voiceURI ?? voices[0]?.voiceURI ?? "";
}

export function speakable(text: string): string {
  return text
    .replace(/\(?From a voice call, kept short on purpose\.?\)?\s*/gi, " ")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[*_#`>]+/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

const BREAK = /(?:\.{3}|…+|[.!?]+)["'“”‘’)\]]*(?:\s+|$)|(?:\n+)/g;

export function takeSpokenSentences(buffer: string): { ready: string[]; rest: string } {
  const src = speakable(buffer);
  if (!src) return { ready: [], rest: "" };
  const ready: string[] = [];
  let last = 0;
  const end = new RegExp(BREAK.source, "g");
  let match = end.exec(src);
  while (match) {
    const piece = src.slice(last, match.index + match[0].length).replace(/\s+/g, " ").trim();
    if (piece) ready.push(piece);
    last = match.index + match[0].length;
    match = end.exec(src);
  }
  const rest = src.slice(last).replace(/\s+/g, " ").trim();
  return { ready, rest };
}

export function speakChunks(text: string): string[] {
  const { ready, rest } = takeSpokenSentences(text);
  return rest ? [...ready, rest] : ready;
}

export function parseCallPrefs(raw: unknown): CallPrefs {
  const src = raw && typeof raw === "object" ? (raw as Partial<CallPrefs>) : {};
  const rate = src.rate;
  return {
    voiceURI: typeof src.voiceURI === "string" ? src.voiceURI : "af_heart",
    rate: rate === "slow" || rate === "fast" ? rate : "natural",
    listenAgain: src.listenAgain !== false,
  };
}
