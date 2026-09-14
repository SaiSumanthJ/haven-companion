import { boxBtn } from "@/features/chat/quietBtn";
import { FitAboutFields } from "@/features/companion/FitAboutFields";
import { FitPersonalityFields } from "@/features/companion/FitPersonalityFields";
import { FitStyleFields } from "@/features/companion/FitStyleFields";
import { emptyFit, type UserFit } from "@/features/companion/userFit";
import { useState } from "react";

type FitPaneProps = {
  fit?: UserFit;
  onSave: (next: UserFit) => void;
};

export function FitPane({ fit, onSave }: FitPaneProps) {
  const [draft, setDraft] = useState<UserFit>(fit ?? emptyFit());

  return (
    <div className="space-y-5">
      <p className="text-xs leading-5 text-[var(--haven-mute)]">
        Same local model. Personality outranks the other notes. These files
        only change the instructions.
      </p>
      <FitPersonalityFields fit={draft} onChange={setDraft} />
      <FitAboutFields fit={draft} onChange={setDraft} />
      <FitStyleFields fit={draft} onChange={setDraft} />
      <button
        type="button"
        onClick={() => onSave(draft)}
        className={boxBtn}
      >
        Save how they know you
      </button>
    </div>
  );
}
