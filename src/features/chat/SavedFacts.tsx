import { quietBtn } from "@/features/chat/quietBtn";

type SavedFactsProps = {
  facts: string[];
  draft: string;
  onDraft: (value: string) => void;
  onAdd: () => void;
  onForget: (fact: string) => void;
};

export function SavedFacts({ facts, draft, onDraft, onAdd, onForget }: SavedFactsProps) {
  return (
    <div className="space-y-3">
      <ul className="space-y-2 text-sm text-[var(--haven-ink)]">
        {facts.length === 0 ? (
          <li className="text-[var(--haven-mute)]">No facts saved yet.</li>
        ) : (
          facts.map((fact) => (
            <li
              key={fact}
              className="flex items-start justify-between gap-3 border-l border-[var(--haven-brass)] pl-3"
            >
              <span>{fact}</span>
              <button
                type="button"
                onClick={() => onForget(fact)}
                className={`shrink-0 ${quietBtn}`}
              >
                Forget
              </button>
            </li>
          ))
        )}
      </ul>
      <form
        className="flex flex-col gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          onAdd();
        }}
      >
        <input
          value={draft}
          onChange={(event) => onDraft(event.target.value)}
          placeholder="Add a fact they should keep"
          className="h-10 rounded-md border border-[var(--haven-edge)] bg-[var(--haven-panel)] px-3 text-sm text-[var(--haven-ink)] outline-none"
        />
        <button
          type="submit"
          className="h-10 rounded-md border border-[var(--haven-edge)] text-sm text-[var(--haven-ink)]"
        >
          Remember this
        </button>
      </form>
    </div>
  );
}
