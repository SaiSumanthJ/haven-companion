import { emptyFit } from "@/features/companion/userFit";
import { contentWithAttachments, sharedLabel } from "./attachContext";
import { contentForModel, stripLeakedCallLabel } from "./turnPace";
import {
  MAX_CHATS,
  MAX_TURNS,
  MODEL_TURNS,
  SUMMARY_MAX,
  type AttachmentNote,
  type HavenChat,
  type HavenState,
  type MemoryTurn,
} from "./types";

export { upsertFromSnapshot } from "./chatsMerge";

function nowIso(): string {
  return new Date().toISOString();
}

export function emptyState(): HavenState {
  const chat = newChat("Room 1");
  return {
    version: 2,
    ageVerified: false,
    adultMode: true,
    companionName: "Ash",
    userFit: emptyFit(),
    knownFacts: [],
    chats: [chat],
    activeChatId: chat.id,
    createdAt: nowIso(),
    lastOpenedAt: nowIso(),
  };
}

export function newChat(title = "New chat"): HavenChat {
  return {
    id: `chat-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title,
    turns: [],
    summary: "",
    createdAt: nowIso(),
  };
}

export function activeChat(state: HavenState): HavenChat {
  return state.chats.find((chat) => chat.id === state.activeChatId) ?? state.chats[0];
}

export function activeTurns(state: HavenState): MemoryTurn[] {
  return activeChat(state)?.turns ?? [];
}

export function hasAnyTurns(state: HavenState): boolean {
  return state.chats.some((chat) => chat.turns.length > 0);
}

export function mapActiveChat(
  state: HavenState,
  update: (chat: HavenChat) => HavenChat,
): HavenState {
  const current = activeChat(state);
  if (!current) return state;
  return {
    ...state,
    chats: state.chats.map((chat) => (chat.id === current.id ? update(chat) : chat)),
  };
}

function nextUserN(chat: HavenChat): number {
  let max = 0;
  for (const turn of chat.turns) {
    if (turn.role === "user" && (turn.n ?? 0) > max) max = turn.n ?? 0;
  }
  return max + 1;
}

export function appendTurn(
  state: HavenState,
  role: MemoryTurn["role"],
  content: string,
  via: MemoryTurn["via"] = "chat",
  attachments?: AttachmentNote[],
): HavenState {
  const notes = attachments?.filter((note) => note.name) ?? [];
  const cleaned = stripLeakedCallLabel(content) || (notes.length ? sharedLabel(notes) : "");
  if (!cleaned) return state;
  return mapActiveChat(state, (chat) => {
    const turn: MemoryTurn = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      role,
      content: cleaned,
      at: nowIso(),
      via,
      n: role === "user" ? nextUserN(chat) : undefined,
      attachments: notes.length ? notes : undefined,
    };
    const turns = [...chat.turns, turn].slice(-MAX_TURNS);
    const untitled = chat.title === "New chat" || /^Room \d+$/.test(chat.title);
    const title = role === "user" && untitled ? titleFromLine(content) : chat.title;
    return { ...chat, turns, title };
  });
}

export function addChat(state: HavenState): HavenState {
  if (state.chats.length >= MAX_CHATS) return state;
  const chat = newChat();
  return { ...state, chats: [...state.chats, chat], activeChatId: chat.id };
}

export function selectChat(state: HavenState, chatId: string): HavenState {
  if (!state.chats.some((chat) => chat.id === chatId)) return state;
  return { ...state, activeChatId: chatId };
}

export function setChatSummary(state: HavenState, chatId: string, summary: string): HavenState {
  return {
    ...state,
    chats: state.chats.map((chat) =>
      chat.id === chatId ? { ...chat, summary: summary.slice(0, SUMMARY_MAX) } : chat,
    ),
  };
}

export function messagesForModel(
  state: HavenState,
  pace: "chat" | "call" = "chat",
): Array<{
  role: "user" | "assistant";
  content: string;
}> {
  const turns = activeTurns(state).slice(-MODEL_TURNS);
  return turns.map((turn, index) => ({
    role: turn.role,
    content: contentWithAttachments(
      contentForModel(turn.content, turn.via, pace),
      turn,
      turns.length - 1 - index,
      pace,
    ),
  }));
}

export function olderTurns(state: HavenState): MemoryTurn[] {
  const turns = activeTurns(state);
  if (turns.length <= MODEL_TURNS) return [];
  return turns.slice(0, -MODEL_TURNS).slice(-20);
}

function titleFromLine(text: string): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= 28) return clean || "New chat";
  return `${clean.slice(0, 27).trim()}…`;
}
