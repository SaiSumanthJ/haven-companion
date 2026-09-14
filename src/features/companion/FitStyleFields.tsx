import { ChoiceRow } from "@/features/companion/ChoiceRow";
import {
  CARES,
  PACES,
  QUESTIONS,
  ROLES,
  TALKS,
  type UserFit,
} from "@/features/companion/userFit";

type FitStyleFieldsProps = {
  fit: UserFit;
  onChange: (next: UserFit) => void;
};

export function FitStyleFields({ fit, onChange }: FitStyleFieldsProps) {
  function patch(part: Partial<UserFit>) {
    onChange({ ...fit, ...part });
  }

  return (
    <div className="space-y-5">
      <ChoiceRow
        label="What they are to you"
        value={fit.role}
        options={ROLES}
        onChange={(role) => patch({ role })}
      />
      <ChoiceRow label="Pace" value={fit.pace} options={PACES} onChange={(pace) => patch({ pace })} />
      <ChoiceRow label="How they talk" value={fit.talk} options={TALKS} onChange={(talk) => patch({ talk })} />
      <ChoiceRow
        label="Questions"
        value={fit.questions}
        options={QUESTIONS}
        onChange={(questions) => patch({ questions })}
      />
      <ChoiceRow
        label="How you feel close"
        value={fit.care}
        options={CARES}
        onChange={(care) => patch({ care })}
      />
    </div>
  );
}
