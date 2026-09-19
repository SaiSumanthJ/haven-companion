import { existsSync } from "node:fs";
import { join } from "node:path";
import { readLocalPrefs } from "@/ports/localPrefs";
import { WHISPER_MODEL } from "./types";

export type WhisperOffer = {
  id: string;
  label: string;
  note: string;
  cached: boolean;
};

export const WHISPER_OFFERS: Array<{ id: string; label: string; note: string }> = [
  { id: "Xenova/whisper-tiny.en", label: "Whisper tiny English", note: "~75MB, fast" },
  { id: "Xenova/whisper-base.en", label: "Whisper base English", note: "~150MB, clearer" },
  { id: "Xenova/whisper-small.en", label: "Whisper small English", note: "~500MB, best of these" },
  { id: "Xenova/whisper-tiny", label: "Whisper tiny, more languages", note: "~75MB" },
];

function cacheDir() {
  return join(process.cwd(), ".haven", "whisper");
}

export function whisperCached(id: string): boolean {
  const slug = `models--${id.replaceAll("/", "--")}`;
  return existsSync(join(cacheDir(), slug));
}

export function selectedWhisperId(): string {
  return readLocalPrefs().whisperModel ?? WHISPER_MODEL;
}

export function listWhisperOffers(): WhisperOffer[] {
  return WHISPER_OFFERS.map((offer) => ({
    ...offer,
    cached: whisperCached(offer.id) || offer.id === selectedWhisperId(),
  }));
}
