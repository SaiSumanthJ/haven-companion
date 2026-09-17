import { activeChat, activeTurns, mapActiveChat } from "./chats";
import { splitSuggestionGroups, unseenFacts } from "./extractFacts";
import type { HavenState, SuggestionBatch } from "./types";

export { RECENT_SUGGESTION_BATCHES, splitSuggestionLists } from "./extractFacts";

const MAX_PENDING_BATCHES = 80;

export type SuggestionGroup = {
  exchangeId: string;
  n: number;
  facts: string[];
};

function nowIso(): string {
  return new Date().toISOString();
}

function uniqueFacts(facts: string[]): string[] {
  return unseenFacts([], facts);
}

function capBatches(batches: SuggestionBatch[]): SuggestionBatch[] {
  return batches
    .map((batch) => ({ ...batch, facts: uniqueFacts(batch.facts) }))
    .filter((batch) => batch.facts.length > 0)
    .slice(0, MAX_PENDING_BATCHES);
}

function userN(state: HavenState, exchangeId: string, fallback?: number): number | undefined {
  const turn = activeTurns(state).find((item) => item.id === exchangeId);
  return turn?.n ?? fallback;
}

export function lastUserTurnId(state: HavenState): string | null {
  const turns = activeTurns(state);
  for (let i = turns.length - 1; i >= 0; i -= 1) {
    if (turns[i]?.role === "user") return turns[i].id;
  }
  return null;
}

export function pushSuggestions(
  state: HavenState,
  exchangeId: string,
  incoming: string[],
): HavenState {
  if (!exchangeId) return state;
  const fresh = unseenFacts(state.knownFacts, incoming);
  if (!fresh.length) return state;
  const n = userN(state, exchangeId);
  return mapActiveChat(state, (chat) => {
    const current = [...(chat.suggestions ?? [])];
    const idx = current.findIndex((batch) => batch.exchangeId === exchangeId);
    if (idx >= 0) {
      const merged = uniqueFacts([...fresh, ...current[idx].facts]);
      const kept = current[idx];
      current.splice(idx, 1);
      return {
        ...chat,
        suggestions: capBatches([
          { exchangeId, at: nowIso(), facts: merged, n: kept.n ?? n },
          ...current,
        ]),
      };
    }
    return {
      ...chat,
      suggestions: capBatches([
        { exchangeId, at: nowIso(), facts: fresh, n },
        ...current,
      ]),
    };
  });
}

export function dropSuggestion(state: HavenState, fact: string): HavenState {
  return mapActiveChat(state, (chat) => ({
    ...chat,
    suggestions: capBatches(
      (chat.suggestions ?? []).map((batch) => ({
        ...batch,
        facts: unseenFacts([fact], batch.facts),
      })),
    ),
  }));
}

export function dropExchangeSuggestions(state: HavenState, exchangeId: string): HavenState {
  return mapActiveChat(state, (chat) => ({
    ...chat,
    suggestions: (chat.suggestions ?? []).filter((batch) => batch.exchangeId !== exchangeId),
  }));
}

export function keepSuggestionsForTurns(state: HavenState): HavenState {
  const ids = new Set(activeTurns(state).map((turn) => turn.id));
  return mapActiveChat(state, (chat) => ({
    ...chat,
    suggestions: (chat.suggestions ?? []).filter((batch) => ids.has(batch.exchangeId)),
  }));
}

export function activeSuggestionGroups(state: HavenState): {
  recent: SuggestionGroup[];
  past: SuggestionGroup[];
} {
  const chat = activeChat(state);
  const idToN = new Map(
    chat.turns
      .filter((turn) => turn.role === "user" && (turn.n ?? 0) > 0)
      .map((turn) => [turn.id, turn.n as number]),
  );
  const batches = (chat.suggestions ?? [])
    .map((batch) => ({
      exchangeId: batch.exchangeId,
      n: batch.n ?? idToN.get(batch.exchangeId) ?? 0,
      facts: batch.facts,
    }))
    .filter((batch) => batch.n > 0);
  return splitSuggestionGroups(state.knownFacts, batches);
}
