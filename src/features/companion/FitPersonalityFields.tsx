import { ChoiceRow } from "@/features/companion/ChoiceRow";
import { PERSONALITY_GROUPS } from "@/features/companion/personalities";
import type { UserFit } from "@/features/companion/userFit";

type FitPersonalityFieldsProps = {
  fit: UserFit;
  onChange: (next: UserFit) => void;
};

export function FitPersonalityFields({ fit, onChange }: FitPersonalityFieldsProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm leading-6 text-[var(--haven-mute)]">
        This note outranks the other setup choices when they disagree. Skip if
        you do not know it. A saved fact still wins.
      </p>
      <ChoiceRow
        label="Personality type"
        value={fit.personality}
        groups={[
          ...PERSONALITY_GROUPS,
          { options: [{ id: "skip", label: "Skip" }] },
        ]}
        onChange={(personality) => onChange({ ...fit, personality })}
      />
    </div>
  );
}
