import type { SendLineOptions } from "@/features/chat/sessionTalk";
import { blobToWhisperSamples } from "@/features/voice/decodeAudio";
import type { CallPrefs } from "@/features/voice/callSpeech";
import { createSpeakPump } from "@/features/voice/speakQueue";
import { transcribeLocal } from "@/features/voice/speechStatus";
import { stopRecorder } from "@/features/voice/recordClip";
import type { MutableRefObject } from "react";

export type CallPhase = "off" | "listening" | "hearing" | "thinking" | "speaking";

type Pump = ReturnType<typeof createSpeakPump>;

type CallTurnApi = {
  alive: MutableRefObject<boolean>;
  recorderRef: MutableRefObject<MediaRecorder | null>;
  chunksRef: MutableRefObject<Blob[]>;
  pumpRef: MutableRefObject<Pump | null>;
  prefs: () => CallPrefs;
  speakTurn: (text: string, options?: SendLineOptions) => Promise<string | null>;
  setPhase: (phase: CallPhase) => void;
  setOfferTalk: (value: boolean) => void;
  offered: () => boolean;
  listenAgain: () => boolean;
  setError: (value: string | null) => void;
  haltSpeech: () => void;
  releaseMic: () => void;
  listen: () => Promise<void>;
};

export async function replyOnCall(text: string, api: CallTurnApi) {
  api.haltSpeech();
  const pump = createSpeakPump(api.prefs);
  api.pumpRef.current = pump;
  await api.speakTurn(text, {
    pace: "call",
    onSpoken: async (sentence) => {
      if (!api.alive.current) return;
      api.setPhase("speaking");
      try {
        await pump.push(sentence);
      } catch {
        /* End stops voice. The room keeps the words. */
      }
    },
  });
  await pump.idle();
  if (!api.alive.current) return;
  const again = api.offered() && api.listenAgain();
  api.setOfferTalk(true);
  if (again) void api.listen();
  else api.setPhase("off");
}

export async function finishCallTalk(api: CallTurnApi) {
  const recorder = api.recorderRef.current;
  if (!recorder) {
    void api.listen();
    return;
  }
  api.setPhase("hearing");
  const blob = await stopRecorder(recorder, api.chunksRef.current);
  api.releaseMic();
  if (blob.size < 1000) {
    api.setError("That take was too short. Speak, then press Done talking.");
    if (api.alive.current) void api.listen();
    return;
  }
  try {
    const text = await transcribeLocal(await blobToWhisperSamples(blob, 16));
    if (!text) {
      api.setError("No words were caught. Speak, then press Done talking.");
      if (api.alive.current) void api.listen();
      return;
    }
    api.setPhase("thinking");
    await replyOnCall(text, api);
  } catch (caught) {
    api.setError(caught instanceof Error ? caught.message : "The call lost that line.");
    if (api.alive.current) api.setPhase("off");
  }
}
