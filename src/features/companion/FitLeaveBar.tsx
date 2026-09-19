import { FitWarn } from "@/features/companion/FitWarn";

type FitLeaveBarProps = {
  onSave: () => void;
  onDiscard: () => void;
};

export function FitLeaveBar({ onSave, onDiscard }: FitLeaveBarProps) {
  return (
    <div className="mb-3">
      <p className="mb-2 text-xs leading-5 text-[var(--haven-mute)]">
        Save or discard how they know you before you leave.
      </p>
      <FitWarn onSave={onSave} onDiscard={onDiscard} />
    </div>
  );
}
