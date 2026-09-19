"use client";

import { DownIcon } from "@/features/chat/ActionIcon";
import { ReplyTurn } from "@/features/chat/ReplyTurn";
import { FactSuggest } from "@/features/chat/FactSuggest";
import { pairTurns } from "@/features/chat/pairTurns";
import { TalkMark } from "@/features/chat/TalkMark";
import { talkPaneId } from "@/features/chat/talkJump";
import { UserPrompt } from "@/features/chat/UserPrompt";
import { useStickToBottom } from "@/features/chat/useStickToBottom";
import { CrisisCard } from "@/features/safety/CrisisCard";
import type { SuggestionGroup } from "@/features/memory/suggestions";
import { factsInText, factsUsed } from "@/features/memory/usedFacts";
import type { MemoryTurn } from "@/features/memory/types";
import { stripLeakedCallLabel } from "@/features/memory/turnPace";

type ChatThreadProps = {
  turns: MemoryTurn[];
  pending: boolean;
  liveReply: string;
  crisisText: string | null;
  pendingLabel: string;
  recentSuggestions: SuggestionGroup[];
  pastSuggestions: SuggestionGroup[];
  onAddSuggestion: (fact: string) => void;
  onRestartPrompt: (turnId: string, text: string) => void;
  knownFacts: string[];
  careNote?: string | null;
};

export function ChatThread({
  turns,
  pending,
  liveReply,
  crisisText,
  pendingLabel,
  recentSuggestions,
  pastSuggestions,
  onAddSuggestion,
  onRestartPrompt,
  knownFacts,
  careNote,
}: ChatThreadProps) {
  const visible = turns
    .map((turn) => ({ ...turn, content: stripLeakedCallLabel(turn.content) }))
    .filter((turn) => turn.content.length > 0);
  const lastAssistant = [...visible].reverse().find((turn) => turn.role === "assistant");
  const pairs = pairTurns(visible);
  const liveFresh = Boolean(pending && liveReply && lastAssistant?.content !== liveReply);
  const stick = useStickToBottom(pending, `${visible.length}:${liveReply.length}`);

  return (
    <div className="haven-thread">
      <div
        ref={stick.scrollerRef}
        onScroll={stick.onScroll}
        className="haven-scroll haven-thread-scroll"
      >
        <div className="haven-thread-talk">
        {pairs.map((pair, index) => {
          const last = index === pairs.length - 1;
          const lastTurn = pair.turns[pair.turns.length - 1];
          const attachLive = last && liveFresh && lastTurn.role === "user";
          const n = pair.turns.find((turn) => turn.role === "user")?.n;
          const userText = pair.turns.find((turn) => turn.role === "user")?.content ?? "";
          const replyText = pair.turns
            .filter((turn) => turn.role === "assistant")
            .map((turn) => turn.content)
            .join("\n");
          return (
            <section
              key={pair.id}
              id={n != null ? talkPaneId(n) : undefined}
              className={`haven-pair${last ? " haven-pair-arrive" : ""}`}
            >
              <TalkMark n={n} />
              {pair.turns.map((turn) =>
                turn.role === "user" ? (
                  <UserPrompt
                    key={turn.id}
                    content={turn.content}
                    attachments={turn.attachments}
                    usedFacts={factsInText(knownFacts, turn.content)}
                    canEdit={!pending}
                    onRestart={(text) => onRestartPrompt(turn.id, text)}
                  />
                ) : (
                  <ReplyTurn
                    key={turn.id}
                    text={turn.content}
                    usedFacts={turn.usedFacts?.length ? turn.usedFacts : factsUsed(knownFacts, userText, replyText)}
                  />
                ),
              )}
              {attachLive ? <ReplyTurn text={liveReply} live /> : null}
              {last && lastTurn.id === lastAssistant?.id && !pending ? (
                <FactSuggest
                  recent={recentSuggestions}
                  past={pastSuggestions}
                  onAdd={onAddSuggestion}
                />
              ) : null}
              {last && pending && !liveReply ? (
                <p className="haven-wait text-sm text-[var(--haven-mute)]">{pendingLabel}</p>
              ) : null}
            </section>
          );
        })}
        {liveFresh && pairs[pairs.length - 1]?.turns.at(-1)?.role !== "user" ? (
          <section className="haven-pair haven-pair-arrive">
            <ReplyTurn text={liveReply} live />
          </section>
        ) : null}
        {pending && !liveReply && pairs.length === 0 ? (
          <p className="haven-wait text-sm text-[var(--haven-mute)]">{pendingLabel}</p>
        ) : null}
        {careNote ? (
          <p className="pb-1 text-xs leading-5 text-[var(--haven-mute)]">{careNote}</p>
        ) : null}
        {crisisText ? <CrisisCard text={crisisText} /> : null}
        </div>
        <div className="haven-thread-gutter">
          {stick.away ? (
            <button
              type="button"
              onClick={stick.jumpToLatest}
              aria-label="Jump to latest"
              title="Latest"
              className="haven-down inline-flex h-9 w-9 items-center justify-center rounded-md border border-[var(--haven-edge)] bg-[var(--haven-panel)] text-[var(--haven-mute)] hover:text-[var(--haven-ink)]"
            >
              <DownIcon />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
