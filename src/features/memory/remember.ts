import { activeChat, setChatSummary } from "./chats";
import { parseFactList, unseenFacts } from "./extractFacts";
import { loadState, saveState } from "./store";
import { ROOM_SUMMARY_TURNS, type HavenState } from "./types";

export async function harvestMemory(state: HavenState): Promise<{
  next: HavenState;
  suggestions: string[];
}> {
  const chat = activeChat(state);
  const recent = chat.turns.slice(-2);
  if (recent.length === 0) return { next: state, suggestions: [] };

  const response = await fetch("/api/remember", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      knownFacts: state.knownFacts,
      recentLines: recent.map((turn) => {
        const extra = (turn.attachments ?? [])
          .map((note) => note.reading.slice(0, 400))
          .join(" ");
        return extra ? `${turn.role}: ${turn.content} ${extra}` : `${turn.role}: ${turn.content}`;
      }),
      roomLines: chat.turns
        .slice(-ROOM_SUMMARY_TURNS)
        .map((turn) => `${turn.role}: ${turn.content}`),
      existingSummary: chat.summary,
    }),
  });
  if (!response.ok) return { next: loadState(), suggestions: [] };

  const body = (await response.json()) as { facts?: string[]; summary?: string; raw?: string };
  const facts = body.facts?.length ? body.facts : parseFactList(body.raw ?? "");
  const latest = loadState();
  let next = latest;
  if (typeof body.summary === "string" && body.summary.trim()) {
    next = setChatSummary(latest, chat.id, body.summary.trim());
    saveState(next);
  }
  return {
    next,
    suggestions: unseenFacts(latest.knownFacts, facts),
  };
}
