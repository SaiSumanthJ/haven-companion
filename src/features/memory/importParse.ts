import { parseFit } from "@/features/companion/userFit";
import { emptyState, newChat } from "./chats";
import { stripLeakedCallLabel } from "./turnPace";
import type { AttachmentNote, HavenChat, HavenState, MemoryTurn, SuggestionBatch } from "./types";

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

function readN(raw: unknown): number | undefined {
  return typeof raw === "number" && raw > 0 && Number.isFinite(raw) ? Math.floor(raw) : undefined;
}

function stampUserN(turns: MemoryTurn[]): MemoryTurn[] {
  let next = 0;
  for (const turn of turns) {
    if (turn.role === "user" && (turn.n ?? 0) > next) next = turn.n ?? 0;
  }
  return turns.map((turn) => {
    if (turn.role !== "user" || (turn.n ?? 0) > 0) return turn;
    next += 1;
    return { ...turn, n: next };
  });
}

function readTurns(raw: unknown): MemoryTurn[] {
  if (!Array.isArray(raw)) return [];
  return stampUserN(
    raw
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
        n: turn.role === "user" ? readN(turn.n) : undefined,
        attachments: readNotes(turn.attachments),
        usedFacts: Array.isArray(turn.usedFacts)
          ? turn.usedFacts.filter((fact): fact is string => typeof fact === "string" && fact.trim().length > 0)
          : undefined,
      }))
      .filter((turn) => turn.content.length > 0 || (turn.attachments?.length ?? 0) > 0),
  );
}

function readSuggestions(raw: unknown): SuggestionBatch[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const batches = raw
    .filter(
      (batch): batch is SuggestionBatch =>
        Boolean(batch) &&
        typeof batch.exchangeId === "string" &&
        typeof batch.at === "string" &&
        Array.isArray(batch.facts),
    )
    .map((batch) => ({
      exchangeId: batch.exchangeId,
      at: batch.at,
      facts: batch.facts.filter((fact): fact is string => typeof fact === "string"),
      n: readN(batch.n),
    }))
    .filter((batch) => batch.facts.length > 0);
  return batches.length ? batches : undefined;
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
        suggestions: readSuggestions(chat.suggestions),
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
