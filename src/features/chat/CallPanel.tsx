import { CallSettings } from "@/features/chat/CallSettings";
import { HintLine, HoverHint } from "@/features/chat/HoverHint";
import type { CallPrefs, VoiceChoice } from "@/features/voice/callSpeech";
import type { CallPhase } from "@/features/voice/useVoiceCall";

type CallPanelProps = {
  companionName: string;
  phase: CallPhase;
  error: string | null;
  prefs: CallPrefs;
  voices: VoiceChoice[];
  onPrefs: (next: CallPrefs) => void;
  onTalk: () => void;
  onPreview: () => void;
  offerTalk: boolean;
};

function phaseLine(name: string, phase: CallPhase): string {
  if (phase === "listening") return "Listening.";
  if (phase === "working") return `${name} is catching your words.`;
  if (phase === "speaking") return `${name} is speaking.`;
  return "Press Talk when you are ready to speak again.";
}

export function CallPanel({
  companionName,
  phase,
  error,
  prefs,
  voices,
  onPrefs,
  onTalk,
  onPreview,
  offerTalk,
}: CallPanelProps) {
  const talkLabel = phase === "listening" ? "Done talking" : "Talk";
  const showTalk = phase === "listening" || offerTalk;

  return (
    <div className="relative z-10 mb-4 space-y-4 rounded-md border border-[var(--haven-edge)] bg-[var(--haven-panel)] px-4 py-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs tracking-[0.18em] text-[var(--haven-brass)] uppercase">
            Voice call
          </p>
          <p className="mt-1 font-serif text-xl text-[var(--haven-ink)]">
            In a call with {companionName}
          </p>
          <p className="mt-2 text-sm leading-6 text-[var(--haven-mute)]">
            {phaseLine(companionName, phase)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {showTalk ? (
            <button
              type="button"
              onClick={onTalk}
              disabled={phase === "working" || phase === "speaking"}
              className="h-11 rounded-md bg-[var(--haven-brass)] px-4 text-sm font-medium text-[var(--haven-night)] disabled:opacity-40"
            >
              {talkLabel}
            </button>
          ) : null}
          <HoverHint label="How this call works">
            <HintLine title="Talk" body="Call starts the first take. After they answer, press Talk, then Done talking." />
            <HintLine title="End" body="Use End in the grid beside Voice. That stops the voice. The written reply stays." />
            <HintLine title="Hearing" body="Whisper on this computer turns your speech into words." />
            <HintLine title="Speaking" body="Kokoro speaks here. Headphones help so the mic does not catch the speakers." />
          </HoverHint>
        </div>
      </div>
      {error ? (
        <p className="text-xs leading-5 text-[var(--haven-crisis-edge)]">{error}</p>
      ) : null}
      <CallSettings prefs={prefs} voices={voices} onChange={onPrefs} onPreview={onPreview} />
    </div>
  );
}
