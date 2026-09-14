"use client";

import { AttachChips } from "@/features/chat/AttachChips";
import { CopyLine } from "@/features/chat/CopyLine";
import { TurnHead } from "@/features/chat/TurnHead";
import { quietBtn, quietBtnBrass } from "@/features/chat/quietBtn";
import type { AttachmentNote } from "@/features/memory/types";
import { useState } from "react";

type UserPromptProps = {
  content: string;
  attachments?: AttachmentNote[];
  canEdit: boolean;
  onRestart: (text: string) => void;
};

export function UserPrompt({ content, attachments, canEdit, onRestart }: UserPromptProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(content);

  if (!editing) {
    return (
      <div className="space-y-2">
        <TurnHead label="You" tone="you">
          {canEdit ? (
            <button
              type="button"
              onClick={() => {
                setDraft(content);
                setEditing(true);
              }}
              className={quietBtn}
            >
              Edit
            </button>
          ) : null}
          <CopyLine text={content} />
        </TurnHead>
        <div className="haven-said haven-said-you space-y-2">
          <p className="whitespace-pre-wrap text-[0.975rem] leading-7 text-[var(--haven-ink)]">
            {content}
          </p>
          <AttachChips notes={attachments} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <TurnHead label="You" tone="you" />
      <textarea
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        rows={3}
        className="w-full rounded-md border border-[var(--haven-edge)] bg-[var(--haven-night)] px-3 py-2 text-[0.975rem] leading-7 text-[var(--haven-ink)] outline-none"
      />
      <div className="flex flex-wrap justify-end gap-2">
        <button
          type="button"
          disabled={!draft.trim()}
          onClick={() => {
            onRestart(draft.trim());
            setEditing(false);
          }}
          className={quietBtnBrass}
        >
          Save and restart from here
        </button>
        <button
          type="button"
          onClick={() => {
            setDraft(content);
            setEditing(false);
          }}
          className={quietBtn}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
