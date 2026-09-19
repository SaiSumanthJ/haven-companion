"use client";

import { TalkMark } from "@/features/chat/TalkMark";
import { quietBtn } from "@/features/chat/quietBtn";
import type { SuggestionGroup } from "@/features/memory/suggestions";
import { useState } from "react";

type FactSuggestProps = {
  recent: SuggestionGroup[];
  past: SuggestionGroup[];
  onAdd: (fact: string) => void;
};

function SnippetList({ facts, onAdd }: { facts: string[]; onAdd: (fact: string) => void }) {
  return (
    <ul className="space-y-2">
      {facts.map((fact) => (
        <li
          key={fact}
          className="flex items-start justify-between gap-3 border-l border-[var(--haven-brass)] pl-3 text-sm text-[var(--haven-ink)]"
        >
          <span>{fact}</span>
          <button type="button" onClick={() => onAdd(fact)} className={`shrink-0 ${quietBtn}`}>
            Add to memory
          </button>
        </li>
      ))}
    </ul>
  );
}

function ExchangeBlock({ group, onAdd }: { group: SuggestionGroup; onAdd: (fact: string) => void }) {
  return (
    <div className="space-y-2">
      <TalkMark n={group.n} />
      <SnippetList facts={group.facts} onAdd={onAdd} />
    </div>
  );
}

export function FactSuggest({ recent, past, onAdd }: FactSuggestProps) {
  const [other, setOther] = useState("");
  const count = [...recent, ...past].reduce((sum, group) => sum + group.facts.length, 0);

  function addOther() {
    const fact = other.trim();
    if (!fact) return;
    onAdd(fact);
    setOther("");
  }

  return (
    <details className="haven-remember rounded-md border border-[var(--haven-edge)] bg-[var(--haven-panel)] px-3 py-2">
      <summary className="cursor-pointer text-xs tracking-[0.14em] text-[var(--haven-brass)] uppercase">
        Suggested memory · {count}
      </summary>
      <div className="haven-draw-body mt-3 space-y-3">
        <p className="text-xs leading-5 text-[var(--haven-mute)]">
          Add only the details you want kept. Open Other if something important is missing.
        </p>
        {recent.length > 0 ? (
          <div className="space-y-3">
            {recent.map((group) => (
              <ExchangeBlock key={group.exchangeId} group={group} onAdd={onAdd} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-[var(--haven-mute)]">Nothing unused from the last three talks.</p>
        )}
        {past.length > 0 ? (
          <details className="haven-remember rounded-md border border-[var(--haven-edge)] bg-[var(--haven-night)] px-3 py-2">
            <summary className="cursor-pointer text-xs tracking-[0.14em] text-[var(--haven-brass)] uppercase">
              Past suggestions · {past.reduce((sum, group) => sum + group.facts.length, 0)}
            </summary>
            <div className="haven-draw-body mt-2 space-y-3">
              {past.map((group) => (
                <ExchangeBlock key={group.exchangeId} group={group} onAdd={onAdd} />
              ))}
            </div>
          </details>
        ) : null}
        <details className="rounded-md border border-[var(--haven-edge)] bg-[var(--haven-night)] px-3 py-2">
          <summary className="cursor-pointer text-xs tracking-[0.14em] text-[var(--haven-brass)] uppercase">
            Other
          </summary>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <input
              value={other}
              onChange={(event) => setOther(event.target.value)}
              placeholder="A detail you want kept"
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
