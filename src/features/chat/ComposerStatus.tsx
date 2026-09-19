import { hearingLine, speakingLine } from "@/features/chat/honestStatus";
import type { WhisperProgress } from "@/features/voice/speechStatus";

type ComposerStatusProps = {
  error?: string | null;
  listening: boolean;
  hearingBusy: boolean;
  hear: WhisperProgress;
  speak: WhisperProgress;
  callActive: boolean;
  callReady: boolean;
};

export function ComposerStatus({
  error,
  listening,
  hearingBusy,
  hear,
  speak,
  callActive,
  callReady,
}: ComposerStatusProps) {
  const hearWait = !callActive ? hearingLine(hear) : "";
  const speakWait = !callReady || callActive ? speakingLine(speak) : "";
  const line =
    error ||
    (hearingBusy
      ? "Turning speech into text on this computer…"
      : listening
        ? "Listening. Press Stop when you are done."
        : hearWait || speakWait);

  if (!line) return null;
  const danger = Boolean(error) || hear.status === "error" || speak.status === "error";
  return (
    <p
      className={`text-xs leading-5 ${
        danger ? "text-[var(--haven-crisis-edge)]" : "text-[var(--haven-mute)]"
      }`}
    >
      {line}
    </p>
  );
}
