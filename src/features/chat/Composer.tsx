"use client";

import { readAttachments } from "@/features/attach/readAttachments";
import type { AttachBundle } from "@/features/attach/types";
import { AttachBar } from "@/features/chat/AttachBar";
import { AttachButton } from "@/features/chat/AttachButton";
import { CallButton } from "@/features/chat/CallButton";
import { ComposerStatus } from "@/features/chat/ComposerStatus";
import { TalkShift } from "@/features/chat/TalkShift";
import { VoiceButton } from "@/features/chat/VoiceButton";
import { useTalkFlash } from "@/features/chat/useTalkFlash";
import { useVoiceToText } from "@/features/voice/useVoiceToText";
import type { WhisperProgress } from "@/features/voice/speechStatus";
import { MAX_ATTACH_FILES } from "@/ports/files/kinds";
import { useState } from "react";

type ComposerProps = {
  value: string;
  pending: boolean;
  callActive: boolean;
  callSupported: boolean;
  callReady: boolean;
  hear: WhisperProgress;
  speak: WhisperProgress;
  onChange: (value: string) => void;
  onSend: (attach?: AttachBundle) => void;
  onCall: () => void;
};

export function Composer({
  value,
  pending,
  callActive,
  callSupported,
  callReady,
  hear,
  speak,
  onChange,
  onSend,
  onCall,
}: ComposerProps) {
  const voice = useVoiceToText(value, onChange);
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send() {
    voice.stop();
    if (!files.length) {
      onSend();
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const bundle = await readAttachments(files);
      setFiles([]);
      onSend(bundle);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Those files could not be read.");
    } finally {
      setBusy(false);
    }
  }

  const mode = callActive ? "call" : voice.listening ? "hear" : "type";
  const flash = useTalkFlash(mode);

  return (
    <div className="space-y-2">
      <TalkShift mode={mode} flash={flash} />
      <form
        className="flex flex-col gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          void send();
        }}
      >
        <AttachBar
          files={files}
          busy={busy}
          error={error}
          disabled={pending || callActive}
          onRemove={(index) => setFiles((current) => current.filter((_, item) => item !== index))}
        />
        <div className="flex items-end gap-3">
          <div className={`relative min-h-[6.5rem] flex-1 ${flash && mode === "type" ? "haven-write is-shift" : ""}`}>
            <textarea
              value={value}
              onChange={(event) => onChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void send();
                }
              }}
              rows={3}
              placeholder="Write what you want to say"
              className="h-full min-h-[6.5rem] w-full resize-none rounded-md border border-[var(--haven-edge)] bg-[var(--haven-panel)] px-4 py-3 text-sm leading-6 text-[var(--haven-ink)] outline-none"
            />
          </div>
          <div className="grid w-[13.5rem] shrink-0 grid-cols-2 gap-2">
            <button
              type="submit"
              disabled={pending || busy || (!value.trim() && files.length === 0)}
              className="h-12 rounded-md bg-[var(--haven-brass)] px-3 text-sm font-medium text-[var(--haven-night)] disabled:opacity-40"
            >
              Send
            </button>
            <AttachButton
              count={files.length}
              busy={busy}
              disabled={pending || callActive}
              onAdd={(list) => {
                if (!list) return;
                setFiles((current) => [...current, ...Array.from(list)].slice(0, MAX_ATTACH_FILES));
              }}
            />
            <VoiceButton
              supported={voice.supported}
              listening={voice.listening}
              disabled={pending || callActive || busy || voice.busy || voice.model.status !== "ready"}
              onToggle={voice.toggle}
            />
            <CallButton
              active={callActive}
              supported={callSupported}
              disabled={pending && !callActive ? true : !callReady && !callActive}
              onClick={onCall}
            />
          </div>
        </div>
      </form>
      <ComposerStatus
        error={error || voice.error}
        listening={voice.listening}
        hearingBusy={voice.busy}
        hear={voice.model.status !== "idle" ? voice.model : hear}
        speak={speak}
        callActive={callActive}
        callReady={callReady}
      />
    </div>
  );
}
