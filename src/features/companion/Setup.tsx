import { FitAboutFields } from "@/features/companion/FitAboutFields";
import { FitPersonalityFields } from "@/features/companion/FitPersonalityFields";
import { FitStyleFields } from "@/features/companion/FitStyleFields";
import { emptyFit, type UserFit } from "@/features/companion/userFit";
import { useState } from "react";

type SetupProps = {
  defaultName: string;
  onStart: (companionName: string, userFit: UserFit) => void;
};

export function Setup({ defaultName, onStart }: SetupProps) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState(defaultName);
  const [fit, setFit] = useState<UserFit>(emptyFit);

  const titles = [
    "Who is waiting in the room?",
    "How do you take in a room?",
    "A little about you",
    "How should they be with you?",
  ];

  return (
    <main className="mx-auto flex min-h-full w-full max-w-lg flex-col justify-center gap-8 px-4 py-16 sm:px-6">
      <p className="text-xs tracking-[0.22em] text-[var(--haven-brass)] uppercase">
        Setup {step + 1} of 4
      </p>
      <h1 className="font-serif text-4xl leading-tight text-[var(--haven-ink)]">{titles[step]}</h1>
      <p className="text-sm leading-6 text-[var(--haven-mute)]">
        The local model on this computer stays the same. These answers change
        how it talks to you. Skip any line you do not want to share.
      </p>
      {step === 0 ? (
        <label className="space-y-2 text-sm text-[var(--haven-mute)]">
          Companion name
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="mt-2 h-12 w-full rounded-md border border-[var(--haven-edge)] bg-[var(--haven-panel)] px-4 text-[var(--haven-ink)] outline-none"
          />
        </label>
      ) : null}
      {step === 1 ? <FitPersonalityFields fit={fit} onChange={setFit} /> : null}
      {step === 2 ? <FitAboutFields fit={fit} onChange={setFit} /> : null}
      {step === 3 ? <FitStyleFields fit={fit} onChange={setFit} /> : null}
      <div className="flex flex-wrap gap-4">
        {step > 0 ? (
          <button
            type="button"
            onClick={() => setStep((current) => current - 1)}
            className="h-12 text-sm text-[var(--haven-mute)] underline-offset-4 hover:underline"
          >
            Back
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => {
            if (step < 3) setStep((current) => current + 1);
            else onStart(name.trim() || defaultName, fit);
          }}
          className="h-12 rounded-md bg-[var(--haven-brass)] px-5 text-sm font-medium text-[var(--haven-night)]"
        >
          {step < 3 ? "Continue" : "Open the room"}
        </button>
      </div>
    </main>
  );
}
