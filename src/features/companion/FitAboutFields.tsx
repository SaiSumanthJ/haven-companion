import { ChoiceRow } from "@/features/companion/ChoiceRow";
import {
  AGE_BANDS,
  GENDERS,
  HOURS,
  HOUSEHOLDS,
  PLACES,
  PRONOUNS,
  type UserFit,
} from "@/features/companion/userFit";

type FitAboutFieldsProps = {
  fit: UserFit;
  onChange: (next: UserFit) => void;
};

export function FitAboutFields({ fit, onChange }: FitAboutFieldsProps) {
  function patch(part: Partial<UserFit>) {
    onChange({ ...fit, ...part });
  }

  return (
    <div className="space-y-5">
      <label className="block space-y-2 text-sm text-[var(--haven-mute)]">
        What should they call you?
        <input
          value={fit.callMe}
          onChange={(event) => patch({ callMe: event.target.value })}
          placeholder="Optional"
          className="mt-2 h-11 w-full rounded-md border border-[var(--haven-edge)] bg-[var(--haven-panel)] px-3 text-[var(--haven-ink)] outline-none"
        />
      </label>
      <ChoiceRow label="Age" value={fit.ageBand} options={AGE_BANDS} onChange={(ageBand) => patch({ ageBand })} />
      <ChoiceRow label="Gender" value={fit.gender} options={GENDERS} onChange={(gender) => patch({ gender })} />
      <ChoiceRow
        label="Pronouns"
        value={fit.pronouns}
        options={PRONOUNS}
        onChange={(pronouns) => patch({ pronouns })}
      />
      <ChoiceRow label="Where you are" value={fit.place} options={PLACES} onChange={(place) => patch({ place })} />
      <ChoiceRow
        label="Who is around"
        value={fit.household}
        options={HOUSEHOLDS}
        onChange={(household) => patch({ household })}
      />
      <ChoiceRow
        label="When you usually talk"
        value={fit.hour}
        options={HOURS}
        onChange={(hour) => patch({ hour })}
      />
    </div>
  );
}
