import { MicIcon } from "@/features/chat/ActionIcon";

type VoiceButtonProps = {
  supported: boolean;
  listening: boolean;
  disabled: boolean;
  onToggle: () => void;
};

export function VoiceButton({
  supported,
  listening,
  disabled,
  onToggle,
}: VoiceButtonProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled || !supported}
      aria-pressed={listening}
      aria-label={listening ? "Stop voice typing" : "Start voice typing"}
      title={supported ? (listening ? "Stop voice" : "Voice") : "Voice needs a microphone"}
      className={`inline-flex h-12 w-full items-center justify-center gap-2 rounded-md px-3 text-sm font-medium ${
        listening
          ? "bg-[var(--haven-brass)] text-[var(--haven-night)]"
          : "border border-[var(--haven-edge)] text-[var(--haven-ink)]"
      } disabled:opacity-40`}
    >
      <MicIcon />
      {listening ? "Stop" : "Voice"}
    </button>
  );
}
