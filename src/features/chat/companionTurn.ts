import type { AttachBundle } from "@/features/attach/types";
import { requestReply } from "@/features/chat/requestReply";
import { OPENING_FALLBACK, OPENING_USER_LINE } from "@/features/companion/opening";
import { activeChat, activeTurns, appendTurn, messagesForModel } from "@/features/memory/chats";
import { applyAssistantDraft } from "@/features/memory/writeAssistant";
import type { HavenState } from "@/features/memory/types";
import { stripLeakedCallLabel } from "@/features/memory/turnPace";
import { finishCallReply } from "@/ports/model/callReply";
import type { TalkPace } from "@/ports/model";

const CALL_FALLBACK = "I'm here. Say that again when you're ready.";

type SpeakArgs = {
  snapshot: HavenState;
  userLine: string;
  persistUser: boolean;
  pace?: TalkPace;
  attach?: AttachBundle;
  onDelta: (chunk: string) => void;
  onUserSaved?: (next: HavenState) => void;
};

function visibleReply(raw: string, pace: TalkPace | undefined): string {
  const cleaned = stripLeakedCallLabel(raw);
  const text = pace === "call" ? finishCallReply(cleaned) : cleaned;
  if (text.trim()) return text;
  return pace === "call" ? CALL_FALLBACK : "The room lost the line. Your words are still saved.";
}

export async function companionTurn({
  snapshot,
  userLine,
  persistUser,
  pace,
  attach,
  onDelta,
  onUserSaved,
}: SpeakArgs): Promise<{ next: HavenState; crisisText: string | null }> {
  const via = pace === "call" ? "call" : "chat";
  const withUser = persistUser
    ? appendTurn(snapshot, "user", userLine, via, attach?.notes)
    : snapshot;
  onUserSaved?.(withUser);
  let latest = withUser;
  let draftId: string | null = null;
  let acc = "";
  let lastShown = "";
  const payload = await requestReply(
    {
      companionName: withUser.companionName,
      adultMode: withUser.adultMode,
      knownFacts: withUser.knownFacts,
      roomSummary: activeChat(withUser)?.summary ?? "",
      userFit: withUser.userFit,
      pace,
      messages: withImages(
        persistUser
          ? messagesForModel(withUser, via)
          : [{ role: "user", content: userLine }],
        attach?.images,
      ),
    },
    (chunk) => {
      acc += chunk;
      const shown = stripLeakedCallLabel(acc);
      if (!shown) return;
      const add = shown.startsWith(lastShown) ? shown.slice(lastShown.length) : shown;
      lastShown = shown;
      if (add) onDelta(add);
      const applied = applyAssistantDraft(latest, draftId, shown, via);
      latest = applied.next;
      draftId = applied.draftId || draftId;
      onUserSaved?.(latest);
    },
  );
  const text = visibleReply(payload.text || acc, pace);
  if (!lastShown) onDelta(text);
  else if (text.startsWith(lastShown)) {
    const add = text.slice(lastShown.length);
    if (add) onDelta(add.startsWith(" ") ? add : ` ${add}`);
  }
  if (draftId) latest = applyAssistantDraft(latest, draftId, text, via).next;
  else latest = appendTurn(withUser, "assistant", text, via);
  onUserSaved?.(latest);
  return { next: latest, crisisText: payload.kind === "crisis" ? text : null };
}

function withImages(
  messages: Array<{ role: "user" | "assistant"; content: string; images?: string[] }>,
  images?: string[],
) {
  if (!images?.length) return messages;
  const next = messages.map((message) => ({ ...message }));
  for (let i = next.length - 1; i >= 0; i -= 1) {
    if (next[i]?.role === "user") {
      next[i] = { ...next[i], images };
      break;
    }
  }
  return next;
}

export async function openingTurn(
  snapshot: HavenState,
  onDelta: (chunk: string) => void,
): Promise<HavenState> {
  if (activeTurns(snapshot).length > 0) return snapshot;
  try {
    const { next } = await companionTurn({
      snapshot,
      userLine: OPENING_USER_LINE,
      persistUser: false,
      onDelta,
    });
    return next;
  } catch {
    return appendTurn(snapshot, "assistant", OPENING_FALLBACK);
  }
}
