"use client";

import type { AttachBundle } from "@/features/attach/types";
import { greetRoom, sendLine, type SendLineOptions } from "@/features/chat/sessionTalk";
import { addChat, hasAnyTurns, selectChat } from "@/features/memory/chats";
import { rewindBeforeTurn } from "@/features/memory/rewind";
import { mergeFacts } from "@/features/memory/extractFacts";
import {
  clearConversation,
  emptyState,
  exportState,
  loadState,
  mergeImported,
  parseImportedState,
  removeFact,
  saveState,
  touchOpened,
} from "@/features/memory/store";
import type { UserFit } from "@/features/companion/userFit";
import { MAX_CHATS, type HavenState } from "@/features/memory/types";
import type { ModelHealth } from "@/ports/model";
import { useEffect, useState } from "react";

export function useHavenSession() {
  const [state, setState] = useState<HavenState>(emptyState);
  const [hydrated, setHydrated] = useState(false);
  const [draft, setDraft] = useState("");
  const [draftFact, setDraftFact] = useState("");
  const [pending, setPending] = useState(false);
  const [liveReply, setLiveReply] = useState("");
  const [crisisText, setCrisisText] = useState<string | null>(null);
  const [health, setHealth] = useState<ModelHealth | null>(null);
  const [needsName, setNeedsName] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [returning, setReturning] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    const loaded = touchOpened(loadState());
    setState(loaded);
    setNeedsName(loaded.ageVerified && !hasAnyTurns(loaded));
    setReturning(hasAnyTurns(loaded) || loaded.knownFacts.length > 0);
    setHydrated(true);
    void fetch("/api/health")
      .then((response) => response.json())
      .then((payload: ModelHealth) => setHealth(payload))
      .catch(() => undefined);
  }, []);

  function commit(next: HavenState) {
    saveState(next);
    setState(next);
  }

  const talk = { commit, setLiveReply, setCrisisText, setPending, setSuggestions };

  return {
    state,
    hydrated,
    draft,
    draftFact,
    pending,
    liveReply,
    crisisText,
    health,
    needsName,
    importError,
    returning,
    suggestions,
    setDraft,
    setDraftFact,
    confirmAge: () => {
      commit({ ...state, ageVerified: true });
      setNeedsName(true);
    },
    startWithName: (companionName: string, userFit: UserFit) => {
      const next = { ...state, companionName, userFit };
      commit(next);
      setNeedsName(false);
      void greetRoom(next, talk);
    },
    saveFit: (userFit: UserFit) => {
      commit({ ...loadState(), userFit });
    },
    addFact: () => {
      const fact = draftFact.trim();
      if (!fact) return;
      commit({ ...state, knownFacts: mergeFacts(state.knownFacts, [fact]) });
      setDraftFact("");
    },
    addSuggestion: (fact: string) => {
      const latest = loadState();
      commit({ ...latest, knownFacts: mergeFacts(latest.knownFacts, [fact]) });
      setSuggestions((current) => current.filter((item) => item !== fact));
    },
    forgetFact: (fact: string) => commit(removeFact(state, fact)),
    startOver: () => {
      const next = clearConversation(state);
      commit(next);
      setReturning(false);
      void greetRoom(next, talk);
    },
    exportMemory: () => exportState(state),
    importMemory: (raw: string) => {
      try {
        const next = mergeImported(state, parseImportedState(raw));
        commit(next);
        setNeedsName(false);
        setReturning(hasAnyTurns(next) || next.knownFacts.length > 0);
        setImportError(null);
      } catch (error) {
        setImportError(error instanceof Error ? error.message : "That file could not be read.");
      }
    },
    toggleAdult: () => commit({ ...state, adultMode: !state.adultMode }),
    renameCompanion: (name: string) => commit({ ...state, companionName: name }),
    openChat: (chatId: string) => {
      commit(selectChat(loadState(), chatId));
      setSuggestions([]);
    },
    newChat: () => {
      const latest = loadState();
      if ((latest.chats?.length ?? 0) >= MAX_CHATS) return;
      const next = addChat(latest);
      commit(next);
      setDraft("");
      setCrisisText(null);
      setSuggestions([]);
      void greetRoom(next, talk);
    },
    send: (attach?: AttachBundle) => {
      const text = draft.trim() || attach?.label || "";
      if (!text || pending) return;
      setDraft("");
      setCrisisText(null);
      setLiveReply("");
      void sendLine(state, text, health, talk, { pace: "chat", attach });
    },
    restartFrom: (turnId: string, text: string) => {
      const line = text.trim();
      if (!line || pending) return;
      const next = rewindBeforeTurn(loadState(), turnId);
      if (!next) return;
      commit(next);
      setCrisisText(null);
      setLiveReply("");
      setSuggestions([]);
      void sendLine(next, line, health, talk, { pace: "chat" });
    },
    speakTurn: (text: string, options?: SendLineOptions) => {
      const line = text.trim();
      if (!line || pending) return Promise.resolve(null);
      setDraft("");
      setCrisisText(null);
      setLiveReply("");
      return sendLine(state, line, health, talk, { pace: "call", ...options });
    },
  };
}
