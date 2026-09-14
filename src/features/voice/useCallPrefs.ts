"use client";

import { CALL_PREFS_EVENT, loadCallPrefs, saveCallPrefs } from "@/features/voice/callPrefs";
import {
  resolveVoiceURI,
  type CallPrefs,
  type VoiceChoice,
} from "@/features/voice/callSpeech";
import {
  canSpeakLocally,
  listLocalVoices,
  speakLocal,
  unlockLocalSpeech,
} from "@/features/voice/localSpeak";
import { fetchSpeakStatus, fetchSpeechStatus } from "@/features/voice/speechStatus";
import { canUseLocalVoice } from "@/features/voice/useVoiceToText";
import { useEffect, useRef, useState } from "react";

export function useCallPrefs() {
  const [prefs, setPrefsState] = useState<CallPrefs>(loadCallPrefs);
  const [voices, setVoices] = useState<VoiceChoice[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const prefsRef = useRef(prefs);

  function apply(next: CallPrefs) {
    prefsRef.current = next;
    setPrefsState(next);
    saveCallPrefs(next);
  }

  useEffect(() => {
    function onPrefs(event: Event) {
      const detail = (event as CustomEvent<CallPrefs>).detail;
      if (!detail || JSON.stringify(detail) === JSON.stringify(prefsRef.current)) return;
      prefsRef.current = detail;
      setPrefsState(detail);
    }
    window.addEventListener(CALL_PREFS_EVENT, onPrefs);
    return () => window.removeEventListener(CALL_PREFS_EVENT, onPrefs);
  }, []);

  useEffect(() => {
    function loadVoices() {
      const next = listLocalVoices();
      setVoices(next);
      const voiceURI = resolveVoiceURI(next, prefsRef.current.voiceURI);
      if (voiceURI && voiceURI !== prefsRef.current.voiceURI) {
        apply({ ...prefsRef.current, voiceURI });
      }
    }
    loadVoices();
    let cancelled = false;
    async function waitModels() {
      let hear = false;
      let speak = false;
      while (!cancelled) {
        const [whisper, voice] = await Promise.all([
          fetchSpeechStatus().catch(() => null),
          fetchSpeakStatus().catch(() => null),
        ]);
        hear = hear || whisper?.status === "ready";
        speak = speak || voice?.status === "ready";
        if (hear && speak) {
          setReady(true);
          return;
        }
        if (whisper?.status === "error" || voice?.status === "error") return;
        await new Promise((resolve) => setTimeout(resolve, 800));
      }
    }
    void waitModels();
    return () => {
      cancelled = true;
    };
  }, []);

  return {
    prefs,
    prefsRef,
    voices,
    ready,
    error,
    setError,
    supported: canUseLocalVoice() && canSpeakLocally(),
    setPrefs: (next: CallPrefs) => {
      apply({ ...next, voiceURI: resolveVoiceURI(voices, next.voiceURI) });
    },
    preview: () => {
      unlockLocalSpeech();
      void speakLocal("This is how I will sound.", prefsRef.current).catch(() => {
        setError("That offline voice could not play. Pick another.");
      });
    },
  };
}
