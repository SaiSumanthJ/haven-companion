import { activeChat, mapActiveChat } from "./chats";
import { keepSuggestionsForTurns } from "./suggestions";
import { turnsBeforePrompt } from "./rewindTurns";
import type { HavenState } from "./types";

export function rewindBeforeTurn(state: HavenState, turnId: string): HavenState | null {
  const chat = activeChat(state);
  const turns = turnsBeforePrompt(chat.turns, turnId);
  if (!turns) return null;
  return keepSuggestionsForTurns(mapActiveChat(state, (current) => ({ ...current, turns })));
}
