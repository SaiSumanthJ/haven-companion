import { emptyState, newChat } from "./chats";
import { normalizeState, parseImportedState } from "./importParse";
import { STORAGE_KEY, type HavenState } from "./types";

export { emptyState } from "./chats";
export { parseImportedState } from "./importParse";

function nowIso(): string {
  return new Date().toISOString();
}

export function loadState(): HavenState {
  if (typeof window === "undefined") return emptyState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    return normalizeState(JSON.parse(raw) as Parameters<typeof normalizeState>[0]);
  } catch {
    return emptyState();
  }
}

export function saveState(state: HavenState): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function touchOpened(state: HavenState): HavenState {
  const next = { ...state, lastOpenedAt: nowIso() };
  saveState(next);
  return next;
}

export function exportState(state: HavenState): string {
  return JSON.stringify(state, null, 2);
}

export function mergeImported(current: HavenState, incoming: HavenState): HavenState {
  return {
    ...incoming,
    ageVerified: current.ageVerified || incoming.ageVerified,
    lastOpenedAt: nowIso(),
  };
}

export function removeFact(state: HavenState, fact: string): HavenState {
  const next = {
    ...state,
    knownFacts: state.knownFacts.filter((item) => item !== fact),
  };
  saveState(next);
  return next;
}

export function clearConversation(state: HavenState): HavenState {
  const chat = newChat("Room 1");
  const next: HavenState = {
    ...state,
    knownFacts: [],
    chats: [chat],
    activeChatId: chat.id,
    lastOpenedAt: nowIso(),
  };
  saveState(next);
  return next;
}
