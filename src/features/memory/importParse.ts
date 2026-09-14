import { parseFit } from "@/features/companion/userFit";
import { emptyState, newChat } from "./chats";
import { stripLeakedCallLabel } from "./turnPace";
import type { AttachmentNote, HavenChat, HavenState, MemoryTurn } from "./types";

function readNotes(raw: unknown): AttachmentNote[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const notes = raw
    .filter((item): item is AttachmentNote =>
      Boolean(item) &&
      typeof item.name === "string" &&
      typeof item.reading === "string" &&
      ["image", "document", "video", "audio", "other"].includes(item.kind),
    )
    .map((item) => ({ name: item.name, kind: item.kind, reading: item.reading }));
  return notes.length ? notes : undefined;
}

function nowIso(): string {
  return new Date().toISOString();
}

function readTurns(raw: unknown): MemoryTurn[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (turn): turn is MemoryTurn =>
        Boolean(turn) &&
        (turn.role === "user" || turn.role === "assistant") &&
        typeof turn.content === "string",
    )
    .map((turn, index): MemoryTurn => ({
      id: turn.id || `import-${index}`,
      role: turn.role,
      content: stripLeakedCallLabel(turn.content),
      at: turn.at || nowIso(),
      via: turn.via === "call" ? "call" : "chat",
      attachments: readNotes(turn.attachments),
    }))
    .filter((turn) => turn.content.length > 0 || (turn.attachments?.length ?? 0) > 0);
}

function readChats(raw: unknown, fallbackTurns: unknown): HavenChat[] {
  if (Array.isArray(raw) && raw.length > 0) {
    return raw
      .filter((chat): chat is Partial<HavenChat> => Boolean(chat) && typeof chat === "object")
      .map((chat, index) => ({
        id: typeof chat.id === "string" ? chat.id : `chat-${index}`,
        title: typeof chat.title === "string" && chat.title.trim() ? chat.title : `Room ${index + 1}`,
        turns: readTurns(chat.turns),
        summary: typeof chat.summary === "string" ? chat.summary : "",
        createdAt: typeof chat.createdAt === "string" ? chat.createdAt : nowIso(),
      }));
  }
  const seeded = newChat("Room 1");
  return [{ ...seeded, turns: readTurns(fallbackTurns) }];
}

type LooseState = {
  companionName?: string;
  adultMode?: boolean;
  ageVerified?: boolean;
  userFit?: unknown;
  knownFacts?: unknown;
  turns?: unknown;
  chats?: unknown;
  activeChatId?: string;
  createdAt?: string;
};

export function normalizeState(parsed: LooseState): HavenState {
  const chats = readChats(parsed.chats, parsed.turns);
  const activeChatId =
    typeof parsed.activeChatId === "string" && chats.some((chat) => chat.id === parsed.activeChatId)
      ? parsed.activeChatId
      : chats[0].id;
  return {
    ...emptyState(),
    companionName:
      typeof parsed.companionName === "string" && parsed.companionName.trim()
        ? parsed.companionName.trim()
        : "Ash",
    adultMode: parsed.adultMode !== false,
    ageVerified: Boolean(parsed.ageVerified),
    userFit: parseFit(parsed.userFit),
    knownFacts: Array.isArray(parsed.knownFacts)
      ? parsed.knownFacts.filter((fact): fact is string => typeof fact === "string")
      : [],
    chats,
    activeChatId,
    createdAt: typeof parsed.createdAt === "string" ? parsed.createdAt : nowIso(),
    lastOpenedAt: nowIso(),
  };
}

export function parseImportedState(raw: string): HavenState {
  const parsed = JSON.parse(raw) as LooseState & { version?: number };
  if (parsed.version !== 1 && parsed.version !== 2) {
    throw new Error("This file is not a Haven memory export.");
  }
  if (typeof parsed.companionName !== "string" || !parsed.companionName.trim()) {
    throw new Error("The export is missing a companion name.");
  }
  if (!Array.isArray(parsed.knownFacts)) {
    throw new Error("The export is missing facts.");
  }
  if (parsed.version === 1 && !Array.isArray(parsed.turns)) {
    throw new Error("The export is missing facts or turns.");
  }
  if (parsed.version === 2 && !Array.isArray(parsed.chats)) {
    throw new Error("The export is missing chats.");
  }
  return normalizeState(parsed);
}
