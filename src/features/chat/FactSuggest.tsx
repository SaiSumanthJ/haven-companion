"use client";

import { quietBtn } from "@/features/chat/quietBtn";
import { useState } from "react";

type FactSuggestProps = {
  facts: string[];
  onAdd: (fact: string) => void;
};

export function FactSuggest({ facts, onAdd }: FactSuggestProps) {
  const [other, setOther] = useState("");

  function addOther() {
    const fact = other.trim();
    if (!fact) return;
    onAdd(fact);
    setOther("");
  }

  return (
    <details className="rounded-md border border-[var(--haven-edge)] bg-[var(--haven-panel)] px-3 py-2">
      <summary className="cursor-pointer text-xs tracking-[0.14em] text-[var(--haven-brass)] uppercase">
        Suggested memory · {facts.length}
      </summary>
      <div className="mt-3 space-y-3">
        <p className="text-xs leading-5 text-[var(--haven-mute)]">
          These are the snippets from this talk. Add only what they should keep.
          Open Other if you want to save a critical detail that was not listed.
        </p>
        {facts.length > 0 ? (
          <ul className="space-y-2">
            {facts.map((fact) => (
              <li
                key={fact}
                className="flex items-start justify-between gap-3 border-l border-[var(--haven-brass)] pl-3 text-sm text-[var(--haven-ink)]"
              >
                <span>{fact}</span>
                <button
                  type="button"
                  onClick={() => onAdd(fact)}
                  className={`shrink-0 ${quietBtn}`}
                >
                  Add to memory
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-[var(--haven-mute)]">No new snippets from this turn yet.</p>
        )}
        <details className="rounded-md border border-[var(--haven-edge)] bg-[var(--haven-night)] px-3 py-2">
          <summary className="cursor-pointer text-xs tracking-[0.14em] text-[var(--haven-brass)] uppercase">
            Other
          </summary>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <input
              value={other}
              onChange={(event) => setOther(event.target.value)}
              placeholder="A critical detail they should keep"
              className="h-10 min-w-0 flex-1 rounded-md border border-[var(--haven-edge)] bg-[var(--haven-panel)] px-3 text-sm text-[var(--haven-ink)] outline-none"
            />
            <button
              type="button"
              onClick={addOther}
              disabled={!other.trim()}
              className={`h-10 shrink-0 ${quietBtn}`}
            >
              Add to memory
            </button>
          </div>
        </details>
      </div>
    </details>
  );
}
