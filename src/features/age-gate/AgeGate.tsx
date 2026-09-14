import { AI_DISCLOSURE } from "@/features/safety/policy";

type AgeGateProps = {
  onConfirm: () => void;
};

export function AgeGate({ onConfirm }: AgeGateProps) {
  return (
    <main className="mx-auto flex min-h-full w-full max-w-lg flex-col justify-center gap-8 px-4 py-16 sm:px-6">
      <p className="text-xs tracking-[0.22em] text-[var(--haven-brass)] uppercase">
        Haven
      </p>
      <div className="space-y-4">
        <h1 className="font-serif text-4xl leading-tight text-[var(--haven-ink)]">
          A private room for people who are 18 or older.
        </h1>
        <p className="text-[var(--haven-mute)] leading-7">
          {AI_DISCLOSURE} This is companionship software, not therapy, not a
          human, and not a clinical service.
        </p>
        <p className="text-[var(--haven-mute)] leading-7">
          You must be 18+ in the United States, United Kingdom, Canada, and
          Australia. Sexual content involving anyone 17 or under is never
          allowed.
        </p>
      </div>
      <button
        type="button"
        onClick={onConfirm}
        className="h-12 rounded-md bg-[var(--haven-brass)] px-5 text-sm font-medium text-[var(--haven-night)]"
      >
        I am 18 or older — continue
      </button>
    </main>
  );
}
