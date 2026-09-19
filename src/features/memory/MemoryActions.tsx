import { quietBtn, quietBtnCrisis } from "@/features/chat/quietBtn";
import { useRef, useState } from "react";

type MemoryActionsProps = {
  adultMode: boolean;
  importError: string | null;
  onToggleAdult: () => void;
  onExport: () => void;
  onImport: (raw: string) => void;
  onStartOver: () => void;
  mode?: "all" | "files" | "reset";
};

export function MemoryActions({
  adultMode,
  importError,
  onToggleAdult,
  onExport,
  onImport,
  onStartOver,
  mode = "all",
}: MemoryActionsProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const files = mode === "all" || mode === "files";
  const reset = mode === "all" || mode === "reset";

  return (
    <div className="flex flex-col gap-3">
      {mode === "all" ? (
        <p className="text-xs leading-5 text-[var(--haven-mute)]">
          Rooms and saved facts live in this browser, on this address. The desktop
          app and a tab can look like two empty houses. Export before you switch.
        </p>
      ) : null}
      {mode === "all" ? (
        <button
          type="button"
          role="switch"
          aria-checked={adultMode}
          onClick={onToggleAdult}
          className="flex h-10 w-full items-center justify-between gap-3 rounded-md border border-[var(--haven-edge)] px-3 text-sm text-[var(--haven-ink)] hover:border-[var(--haven-brass)]"
        >
          <span>Adult conversations</span>
          <span
            aria-hidden
            className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-300 ${
              adultMode ? "bg-[var(--haven-brass)]" : "bg-[var(--haven-edge)]"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-[var(--haven-night)] transition-transform duration-300 ease-out ${
                adultMode ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </span>
        </button>
      ) : null}
      {files ? (
        <>
          <button
            type="button"
            onClick={onExport}
            className={quietBtn}
          >
            Export my memory
          </button>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className={quietBtn}
          >
            Import memory
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (!file) return;
              void file.text().then(onImport);
            }}
          />
          {importError ? (
            <p className="text-xs leading-5 text-[var(--haven-crisis-edge)]">{importError}</p>
          ) : null}
        </>
      ) : null}
      {reset ? (
        confirmClear ? (
          <button
            type="button"
            onClick={() => {
              onStartOver();
              setConfirmClear(false);
            }}
            className={quietBtnCrisis}
          >
            Yes, clear facts and chat
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmClear(true)}
            className={quietBtn}
          >
            Start over
          </button>
        )
      ) : null}
    </div>
  );
}
