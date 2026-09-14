"use client";

import type { SendLineOptions } from "@/features/chat/sessionTalk";
import { finishCallTalk, replyOnCall, type CallPhase } from "@/features/voice/callTurn";
import { useCallPrefs } from "@/features/voice/useCallPrefs";
import {
  canSpeakLocally,
  stopLocalSpeech,
  unlockLocalSpeech,
} from "@/features/voice/localSpeak";
import { openMicRecorder } from "@/features/voice/recordClip";
import { createSpeakPump } from "@/features/voice/speakQueue";
import { canUseLocalVoice } from "@/features/voice/useVoiceToText";
import { useRef, useState } from "react";

export type { CallPhase };

export function useVoiceCall(
  speakTurn: (text: string, options?: SendLineOptions) => Promise<string | null>,
) {
  const call = useCallPrefs();
  const [active, setActive] = useState(false);
  const [phase, setPhase] = useState<CallPhase>("off");
  const [offerTalk, setOfferTalk] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const pumpRef = useRef<ReturnType<typeof createSpeakPump> | null>(null);
  const alive = useRef(false);
  const phaseRef = useRef(phase);
  const activeRef = useRef(active);
  phaseRef.current = phase;
  activeRef.current = active;

  function releaseMic() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    recorderRef.current = null;
  }

  function haltSpeech() {
    pumpRef.current?.stop();
    stopLocalSpeech();
  }

  function dropMic() {
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
    releaseMic();
  }

  async function listen() {
    if (!alive.current) return;
    call.setError(null);
    try {
      const opened = await openMicRecorder();
      streamRef.current = opened.stream;
      chunksRef.current = opened.chunks;
      recorderRef.current = opened.recorder;
      setPhase("listening");
    } catch {
      call.setError("Microphone permission is off. Allow it, then press Call again.");
      setPhase("off");
      setActive(false);
      alive.current = false;
    }
  }

  function turnApi() {
    return {
      alive,
      recorderRef,
      chunksRef,
      pumpRef,
      prefs: () => call.prefsRef.current,
      speakTurn,
      setPhase,
      setOfferTalk,
      offered: () => offerTalk,
      listenAgain: () => call.prefsRef.current.listenAgain,
      setError: call.setError,
      haltSpeech,
      releaseMic,
      listen,
    };
  }

  function end() {
    alive.current = false;
    haltSpeech();
    dropMic();
    setOfferTalk(false);
    setActive(false);
    setPhase("off");
  }

  return {
    active,
    phase,
    offerTalk,
    error: call.error,
    prefs: call.prefs,
    voices: call.voices,
    supported: call.supported,
    ready: call.ready,
    setPrefs: call.setPrefs,
    preview: call.preview,
    replyTo: (text: string) => replyOnCall(text, turnApi()),
    hold: () => {
      haltSpeech();
      dropMic();
      if (alive.current) setPhase("working");
    },
    start: () => {
      if (!canUseLocalVoice()) return call.setError("Call needs a microphone in this browser.");
      if (!canSpeakLocally()) return call.setError("This browser cannot play the spoken voice.");
      if (!call.ready) return call.setError("The spoken voice is still landing on this computer. Wait, then press Call.");
      alive.current = true;
      setOfferTalk(false);
      setActive(true);
      unlockLocalSpeech();
      void fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ warm: true, pace: "call" }),
      }).catch(() => undefined);
      void listen();
    },
    end,
    toggleTalk: () => {
      if (!activeRef.current || phaseRef.current === "working") return;
      if (phaseRef.current === "listening") void finishCallTalk(turnApi());
      else {
        haltSpeech();
        void listen();
      }
    },
  };
}
