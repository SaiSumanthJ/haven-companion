import { ClipIcon } from "@/features/chat/ActionIcon";
import { MAX_ATTACH_FILES } from "@/ports/files/kinds";

type AttachButtonProps = {
  count: number;
  busy: boolean;
  disabled: boolean;
  onAdd: (files: FileList | null) => void;
};

export function AttachButton({ count, busy, disabled, onAdd }: AttachButtonProps) {
  return (
    <label
      className={`inline-flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-[var(--haven-edge)] px-3 text-sm text-[var(--haven-ink)] ${
        disabled || busy || count >= MAX_ATTACH_FILES ? "opacity-40" : ""
      }`}
    >
      <input
        type="file"
        multiple
        disabled={disabled || busy || count >= MAX_ATTACH_FILES}
        accept="image/*,video/*,audio/*,.pdf,.docx,.txt,.md,.csv,.json,.html,.rtf,.mp4,.webm,.mov,.mp3,.wav,.m4a"
        className="sr-only"
        onChange={(event) => {
          onAdd(event.target.files);
          event.target.value = "";
        }}
      />
      <ClipIcon />
      Attach
    </label>
  );
}
