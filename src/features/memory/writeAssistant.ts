import { activeTurns, appendTurn, mapActiveChat } from "./chats";
import type { HavenState, MemoryTurn } from "./types";
import { factsUsed } from "./usedFacts";
import { stripLeakedCallLabel } from "./turnPace";

export function patchTurnContent(
  state: HavenState,
  turnId: string,
  content: string,
): HavenState {
  const cleaned = stripLeakedCallLabel(content);
  return mapActiveChat(state, (chat) => ({
    ...chat,
    turns: chat.turns.map((turn) => (turn.id === turnId ? { ...turn, content: cleaned } : turn)),
  }));
}

export function applyAssistantDraft(
  state: HavenState,
  draftId: string | null,
  content: string,
  via: MemoryTurn["via"] = "chat",
): { next: HavenState; draftId: string } {
  if (draftId) return { next: patchTurnContent(state, draftId, content), draftId };
  const next = appendTurn(state, "assistant", content, via);
  const id = activeTurns(next).at(-1)?.id;
  if (!id) return { next, draftId: "" };
  return { next, draftId: id };
}

export function stampUsedFacts(
  state: HavenState,
  userText: string,
  replyText: string,
): HavenState {
  const used = factsUsed(state.knownFacts, userText, replyText);
  const last = activeTurns(state).at(-1);
  if (!last || last.role !== "assistant") return state;
  return mapActiveChat(state, (chat) => ({
    ...chat,
    turns: chat.turns.map((turn) =>
      turn.id === last.id ? { ...turn, usedFacts: used } : turn,
    ),
  }));
}
