"use client";

import { DownIcon } from "@/features/chat/ActionIcon";
import { ReplyTurn } from "@/features/chat/ReplyTurn";
import { FactSuggest } from "@/features/chat/FactSuggest";
import { pairTurns } from "@/features/chat/pairTurns";
import { UserPrompt } from "@/features/chat/UserPrompt";
import { useStickToBottom } from "@/features/chat/useStickToBottom";
import { CrisisCard } from "@/features/safety/CrisisCard";
import type { MemoryTurn } from "@/features/memory/types";
import { stripLeakedCallLabel } from "@/features/memory/turnPace";

type ChatThreadProps = {
  turns: MemoryTurn[];
  pending: boolean;
  liveReply: string;
  crisisText: string | null;
  pendingLabel: string;
  suggestions: string[];
  onAddSuggestion: (fact: string) => void;
  onRestartPrompt: (turnId: string, text: string) => void;
  careNote?: string | null;
};

export function ChatThread({
  turns,
  pending,
  liveReply,
  crisisText,
  pendingLabel,
  suggestions,
  onAddSuggestion,
  onRestartPrompt,
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
    <div className="relative min-h-0 flex-1 overflow-hidden">
      <div
        ref={stick.scrollerRef}
        onScroll={stick.onScroll}
        className="haven-scroll absolute inset-0 flex flex-col gap-5 overflow-y-auto pr-12"
      >
        {pairs.map((pair, index) => {
          const last = index === pairs.length - 1;
          const lastTurn = pair.turns[pair.turns.length - 1];
          const attachLive = last && liveFresh && lastTurn.role === "user";
          return (
            <section key={pair.id} className="haven-pair">
              {pair.turns.map((turn) =>
                turn.role === "user" ? (
                  <UserPrompt
                    key={turn.id}
                    content={turn.content}
                    attachments={turn.attachments}
                    canEdit={!pending}
                    onRestart={(text) => onRestartPrompt(turn.id, text)}
                  />
                ) : (
                  <ReplyTurn key={turn.id} text={turn.content} />
                ),
              )}
              {attachLive ? <ReplyTurn text={liveReply} live /> : null}
              {last && lastTurn.id === lastAssistant?.id && !pending ? (
                <FactSuggest facts={suggestions} onAdd={onAddSuggestion} />
              ) : null}
              {last && pending && !liveReply ? (
                <p className="text-sm text-[var(--haven-mute)]">{pendingLabel}</p>
              ) : null}
            </section>
          );
        })}
        {liveFresh && pairs[pairs.length - 1]?.turns.at(-1)?.role !== "user" ? (
          <section className="haven-pair">
            <ReplyTurn text={liveReply} live />
          </section>
        ) : null}
        {pending && !liveReply && pairs.length === 0 ? (
          <p className="text-sm text-[var(--haven-mute)]">{pendingLabel}</p>
        ) : null}
        {careNote ? (
          <p className="pb-1 text-xs leading-5 text-[var(--haven-mute)]">{careNote}</p>
        ) : null}
        {crisisText ? <CrisisCard text={crisisText} /> : null}
      </div>
      {stick.away ? (
        <button
          type="button"
          onClick={stick.jumpToLatest}
          aria-label="Jump to latest"
          title="Latest"
          className="absolute bottom-3 right-4 inline-flex h-9 w-9 items-center justify-center rounded-md border border-[var(--haven-edge)] bg-[var(--haven-panel)] text-[var(--haven-mute)] hover:text-[var(--haven-ink)]"
        >
          <DownIcon />
        </button>
      ) : null}
    </div>
  );
}
