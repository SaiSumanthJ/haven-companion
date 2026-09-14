import { ChoiceRow } from "@/features/companion/ChoiceRow";
import { PERSONALITIES, PERSONALITY_GROUPS } from "@/features/companion/personalities";
import type { UserFit } from "@/features/companion/userFit";

type FitPersonalityFieldsProps = {
  fit: UserFit;
  onChange: (next: UserFit) => void;
};

export function FitPersonalityFields({ fit, onChange }: FitPersonalityFieldsProps) {
  return (
    <div className="space-y-5">
      <p className="text-sm leading-6 text-[var(--haven-mute)]">
        This note outranks the other setup choices when they disagree. Skip if
        you do not know it. A saved fact still wins.
      </p>
      {PERSONALITY_GROUPS.map((group) => (
        <ChoiceRow
          key={group.title}
          label={group.title}
          value={fit.personality}
          options={group.options}
          onChange={(personality) => onChange({ ...fit, personality })}
        />
      ))}
      <ChoiceRow
        label="None of these"
        value={fit.personality}
        options={PERSONALITIES.filter((item) => item.id === "skip")}
        onChange={(personality) => onChange({ ...fit, personality })}
      />
    </div>
  );
}
