import type { CallPrefs } from "@/features/voice/callSpeech";
import type { CallPhase } from "@/features/voice/callTurn";
import type { WhisperProgress } from "@/features/voice/speechStatus";

export function hearingLine(progress: WhisperProgress): string {
  if (progress.status === "error") return progress.detail;
  if (progress.status === "downloading") {
    return progress.detail || `Hearing is still loading… ${progress.percent}%`;
  }
  if (progress.status === "idle") {
    return progress.detail || "Hearing is starting on this computer…";
  }
  return "";
}

export function speakingLine(progress: WhisperProgress): string {
  if (progress.status === "error") return progress.detail;
  if (progress.status === "downloading") {
    return progress.detail || `Spoken voice is still loading… ${progress.percent}%`;
  }
  if (progress.status === "idle") {
    return progress.detail || "Spoken voice is starting on this computer…";
  }
  return "";
}

export function callPhaseLine(
  name: string,
  phase: CallPhase,
  prefs: Pick<CallPrefs, "hands">,
): string {
  if (phase === "listening") {
    return prefs.hands === "auto"
      ? "Hearing you. I will take the pause, or press Done talking."
      : "Hearing you. Press Done talking when you are finished.";
  }
  if (phase === "hearing") return "Turning your speech into words on this computer…";
  if (phase === "thinking") return "Waiting for the local model…";
  if (phase === "speaking") return `${name} is speaking on this computer.`;
  return prefs.hands === "auto"
    ? "Ready for the next take."
    : "Press Talk when you are ready to speak again.";
}
