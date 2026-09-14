"use client";

import { joinSpoken } from "@/features/chat/speech";
import { blobToWhisperSamples } from "@/features/voice/decodeAudio";
import { openMicRecorder, stopRecorder } from "@/features/voice/recordClip";
import {
  fetchSpeechStatus,
  transcribeLocal,
  type WhisperProgress,
} from "@/features/voice/speechStatus";
import { useEffect, useRef, useState } from "react";

export function canUseLocalVoice(): boolean {
  return (
    typeof window !== "undefined" &&
    Boolean(navigator.mediaDevices?.getUserMedia) &&
    typeof MediaRecorder !== "undefined"
  );
}

export function useVoiceToText(value: string, onChange: (next: string) => void) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [model, setModel] = useState<WhisperProgress>({
    status: "idle",
    percent: 0,
    detail: "",
  });
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const valueRef = useRef(value);

  useEffect(() => {
    setSupported(canUseLocalVoice());
    let cancelled = false;
    async function poll() {
      while (!cancelled) {
        try {
          const next = await fetchSpeechStatus();
          if (!cancelled) setModel(next);
          if (next.status === "ready" || next.status === "error") return;
        } catch {
          if (!cancelled) {
            setModel({
              status: "error",
              percent: 0,
              detail: "The voice model could not start. Stay on this page, then try Voice again.",
            });
          }
          return;
        }
        await new Promise((resolve) => setTimeout(resolve, 800));
      }
    }
    void poll();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      if (recorderRef.current?.state === "recording") recorderRef.current.stop();
    };
  }, []);

  async function start() {
    setError(null);
    if (model.status !== "ready") {
      setError(model.detail || "Voice is still preparing. Wait a moment, then try again.");
      return;
    }
    try {
      const opened = await openMicRecorder();
      streamRef.current = opened.stream;
      chunksRef.current = opened.chunks;
      recorderRef.current = opened.recorder;
      setListening(true);
    } catch (caught) {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setListening(false);
      setError(
        caught instanceof Error && /permission|notallowed|denied/i.test(caught.message)
          ? "Microphone permission is off. Allow it in the browser, then try Voice again."
          : "Voice could not start. Allow the microphone, then try again — or type.",
      );
    }
  }

  async function finish() {
    const recorder = recorderRef.current;
    recorderRef.current = null;
    setListening(false);
    if (!recorder) return;
    const blob = await stopRecorder(recorder, chunksRef.current);
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (blob.size < 1000) {
      setError("That take was too short. Hold Voice for a second, then speak.");
      return;
    }
    setBusy(true);
    try {
      const text = await transcribeLocal(await blobToWhisperSamples(blob));
      if (!text) {
        setError("No words were caught. Try again a little closer to the mic.");
        return;
      }
      onChange(joinSpoken(valueRef.current, text));
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "The on-device voice model could not read that.",
      );
    } finally {
      setBusy(false);
    }
  }

  return {
    supported,
    listening,
    busy,
    error,
    model,
    toggle: () => {
      if (listening) void finish();
      else if (!busy) void start();
    },
    stop: () => {
      if (listening) void finish();
    },
  };
}
