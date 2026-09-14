"use client";

type AttachBarProps = {
  files: File[];
  busy: boolean;
  error: string | null;
  disabled: boolean;
  onRemove: (index: number) => void;
};

export function AttachBar({ files, busy, error, disabled, onRemove }: AttachBarProps) {
  if (!files.length && !busy && !error) return null;
  return (
    <div className="space-y-2">
      {files.length > 0 ? (
        <ul className="flex flex-wrap gap-2">
          {files.map((file, index) => (
            <li
              key={`${file.name}-${index}`}
              className="flex items-center gap-2 rounded-md border border-[var(--haven-edge)] bg-[var(--haven-panel)] px-2 py-1 text-xs text-[var(--haven-ink)]"
            >
              <span className="max-w-[12rem] truncate">{file.name}</span>
              <button
                type="button"
                disabled={disabled || busy}
                onClick={() => onRemove(index)}
                className="rounded-md border border-[var(--haven-edge)] px-2 py-0.5 text-[var(--haven-mute)] hover:border-[var(--haven-brass)] hover:text-[var(--haven-ink)] disabled:opacity-40"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {busy ? (
        <p className="text-xs leading-5 text-[var(--haven-mute)]">Reading the files…</p>
      ) : null}
      {error ? (
        <p className="text-xs leading-5 text-[var(--haven-crisis-edge)]">{error}</p>
      ) : null}
    </div>
  );
}
