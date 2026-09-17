import type { AttachBundle } from "@/features/attach/types";
import { companionTurn, openingTurn } from "@/features/chat/companionTurn";
import { takeSpokenSentences } from "@/features/voice/callSpeech";
import { activeTurns, appendTurn, upsertFromSnapshot } from "@/features/memory/chats";
import { extractHeuristicFacts, unseenFacts } from "@/features/memory/extractFacts";
import { harvestMemory } from "@/features/memory/remember";
import {
  dropExchangeSuggestions,
  lastUserTurnId,
  pushSuggestions,
} from "@/features/memory/suggestions";
import { loadState } from "@/features/memory/store";
import type { HavenState } from "@/features/memory/types";
import { CALL_SENTENCE_CAP, type ModelHealth, type TalkPace } from "@/ports/model";

type TalkApi = {
  commit: (next: HavenState) => void;
  setLiveReply: (value: string | ((current: string) => string)) => void;
  setCrisisText: (value: string | null) => void;
  setPending: (value: boolean) => void;
};

function keep(commit: TalkApi["commit"], snapshot: HavenState) {
  commit(upsertFromSnapshot(loadState(), snapshot));
}

export async function greetRoom(snapshot: HavenState, api: TalkApi) {
  if (activeTurns(snapshot).length > 0) return;
  api.setPending(true);
  api.setLiveReply("");
  try {
    keep(api.commit, await openingTurn(snapshot, (chunk) => api.setLiveReply((c) => c + chunk)));
  } finally {
    api.setLiveReply("");
    api.setPending(false);
  }
}

function lastAssistant(state: HavenState): string | null {
  const last = activeTurns(state).at(-1);
  return last?.role === "assistant" ? last.content : null;
}

export type SendLineOptions = {
  pace?: TalkPace;
  attach?: AttachBundle;
  onSpoken?: (sentence: string) => void | Promise<void>;
};

function feedSpoken(onSpoken?: SendLineOptions["onSpoken"]) {
  let pending = "";
  let spoken = 0;
  let chain = Promise.resolve();
  function feed(chunk: string, final = false) {
    pending += chunk;
    chain = chain.then(async () => {
      const { ready, rest } = takeSpokenSentences(pending);
      pending = rest;
      const lines = final && pending.trim() ? [...ready, pending.trim()] : ready;
      if (final) pending = "";
      for (const sentence of lines) {
        if (spoken >= CALL_SENTENCE_CAP) break;
        spoken += 1;
        try {
          await onSpoken?.(sentence);
        } catch {
          /* Voice can stop. The written reply stays. */
        }
      }
    });
    return chain;
  }
  return {
    push: (chunk: string) => feed(chunk),
    flush: () => feed("", true),
  };
}

export async function sendLine(
  state: HavenState,
  text: string,
  health: ModelHealth | null,
  api: TalkApi,
  options?: SendLineOptions,
): Promise<string | null> {
  const hints = unseenFacts(state.knownFacts, extractHeuristicFacts(text));
  api.setPending(true);
  let saved: HavenState | null = null;
  let blocked = false;
  let spoken: string | null = null;
  let tagged = false;
  const spokenOut = feedSpoken(options?.onSpoken);
  try {
    const result = await companionTurn({
      snapshot: state,
      userLine: text,
      persistUser: true,
      pace: options?.pace,
      attach: options?.attach,
      onUserSaved: (next) => {
        keep(api.commit, next);
        if (tagged || !hints.length) return;
        const id = lastUserTurnId(loadState());
        if (!id) return;
        api.commit(pushSuggestions(loadState(), id, hints));
        tagged = true;
      },
      onDelta: (chunk) => {
        api.setLiveReply((current) => current + chunk);
        if (options?.onSpoken) void spokenOut.push(chunk);
      },
    });
    api.setCrisisText(result.crisisText);
    keep(api.commit, result.next);
    saved = result.next;
    blocked = Boolean(result.crisisText);
    spoken = lastAssistant(result.next);
    api.setLiveReply("");
    api.setPending(false);
    if (options?.onSpoken) {
      try {
        await spokenOut.flush();
      } catch {
        /* Ending the call stops the voice, not the saved reply. */
      }
    }
    if (blocked && saved) {
      const id = lastUserTurnId(saved);
      if (id) api.commit(dropExchangeSuggestions(saved, id));
    }
  } catch {
    const latest = loadState();
    const already = lastAssistant(latest);
    if (already) {
      spoken = already;
      saved = latest;
    } else {
      const lost = "The room lost the line. Your words are still saved.";
      keep(api.commit, appendTurn(latest, "assistant", lost));
      spoken = lost;
    }
  } finally {
    api.setLiveReply("");
    api.setPending(false);
  }
  if (saved && !blocked && health?.adapter !== "mock") {
    void harvestMemory(saved)
      .then((harvested) => {
        const id = lastUserTurnId(harvested.next);
        api.commit(
          id
            ? pushSuggestions(harvested.next, id, [...hints, ...harvested.suggestions])
            : harvested.next,
        );
      })
      .catch(() => undefined);
  }
  return spoken;
}
