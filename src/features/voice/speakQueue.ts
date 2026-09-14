import { playLocalBuffer, prepareLocalSpeech, stopLocalSpeech } from "@/features/voice/localSpeak";
import type { CallPrefs } from "@/features/voice/callSpeech";

export function createSpeakPump(prefs: () => CallPrefs) {
  let play = Promise.resolve();
  let live = true;

  function push(text: string): Promise<void> {
    const line = text.trim();
    if (!line || !live) return play;
    const ready = prepareLocalSpeech(line, prefs());
    play = play.then(async () => {
      if (!live) return;
      try {
        const buffer = await ready;
        if (!live) return;
        await playLocalBuffer(buffer, prefs());
      } catch {
        /* Ending the call can stop playback. */
      }
    });
    return play;
  }

  return {
    push,
    idle: () => play,
    stop() {
      live = false;
      stopLocalSpeech();
    },
  };
}
