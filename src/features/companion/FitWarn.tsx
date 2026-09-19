import { boxBtn } from "@/features/chat/quietBtn";
import { quietBtn } from "@/features/chat/quietBtn";

type FitWarnProps = {
  onSave: () => void;
  onDiscard: () => void;
};

export function FitWarn({ onSave, onDiscard }: FitWarnProps) {
  return (
    <div className="space-y-3 rounded-md border border-[var(--haven-brass)] px-3 py-3">
      <p className="text-xs leading-5 text-[var(--haven-ink)]">
        You changed how they know you. Save these changes or discard them. The next
        message will not use them until you save.
      </p>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={onSave} className={boxBtn}>
          Save how they know you
        </button>
        <button type="button" onClick={onDiscard} className={quietBtn}>
          Discard
        </button>
      </div>
    </div>
  );
}
