"use client";

import { boxBtn } from "@/features/chat/quietBtn";
import { FitAboutFields } from "@/features/companion/FitAboutFields";
import { FitPersonalityFields } from "@/features/companion/FitPersonalityFields";
import { FitStyleFields } from "@/features/companion/FitStyleFields";
import { emptyFit, type UserFit } from "@/features/companion/userFit";
import { useEffect, useState } from "react";

type FitPaneProps = {
  fit?: UserFit;
  onSave: (next: UserFit) => void;
};

export function FitPane({ fit, onSave }: FitPaneProps) {
  const [draft, setDraft] = useState<UserFit>(fit ?? emptyFit());
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setDraft(fit ?? emptyFit());
  }, [fit]);

  return (
    <div className="space-y-5">
      <p className="text-xs leading-5 text-[var(--haven-mute)]">
        Open a line to change it. Personality types sit in Analysts, Diplomats,
        Sentinels, and Explorers. These files only change the instructions for
        the same model. The brain itself is under Local models.
      </p>
      <FitPersonalityFields fit={draft} onChange={setDraft} />
      <FitAboutFields fit={draft} onChange={setDraft} />
      <FitStyleFields fit={draft} onChange={setDraft} />
      <button
        type="button"
        onClick={() => {
          onSave(draft);
          setSaved(true);
        }}
        className={boxBtn}
      >
        Save how they know you
      </button>
      {saved ? (
        <p className="text-xs text-[var(--haven-brass)]">Saved. The next message uses this.</p>
      ) : null}
    </div>
  );
}
