import { mergeFacts } from "./extractFacts";
import { stripLeakedCallLabel } from "./turnPace";
import type { HavenChat, HavenState, MemoryTurn } from "./types";

function cleanTurns(turns: MemoryTurn[]): MemoryTurn[] {
  return turns
    .map((turn) => ({
      ...turn,
      content: stripLeakedCallLabel(turn.content),
      attachments: turn.attachments?.filter((note) => note.name && note.reading),
    }))
    .filter((turn) => turn.content.length > 0 || (turn.attachments?.length ?? 0) > 0);
}

function incomingLastWins(chat: HavenChat, incoming: HavenChat): HavenChat {
  const incomingLast = incoming.turns.at(-1);
  const diskLast = chat.turns.at(-1);
  if (incomingLast?.id && incomingLast.id === diskLast?.id) return incoming;
  return (incomingLast?.content.length ?? 0) >= (diskLast?.content.length ?? 0)
    ? incoming
    : chat;
}

export function upsertFromSnapshot(disk: HavenState, snapshot: HavenState): HavenState {
  const raw = snapshot.chats.find((chat) => chat.id === snapshot.activeChatId) ?? snapshot.chats[0];
  if (!raw) return disk;
  const incoming = { ...raw, turns: cleanTurns(raw.turns) };
  const exists = disk.chats.some((chat) => chat.id === incoming.id);
  return {
    ...disk,
    companionName: snapshot.companionName,
    adultMode: snapshot.adultMode,
    knownFacts: mergeFacts(disk.knownFacts, snapshot.knownFacts),
    chats: exists
      ? disk.chats.map((chat) => {
          if (chat.id !== incoming.id) return chat;
          const chosen =
            incoming.turns.length !== chat.turns.length
              ? incoming.turns.length > chat.turns.length
                ? incoming
                : chat
              : incomingLastWins(chat, incoming);
          return { ...chosen, suggestions: chat.suggestions };
        })
      : [...disk.chats, incoming],
  };
}
