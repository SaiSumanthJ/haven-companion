"use client";

import { InfoIcon } from "@/features/chat/ActionIcon";
import { useState, type ReactNode } from "react";

type HoverHintProps = {
  label: string;
  children: ReactNode;
};

export function HoverHint({ label, children }: HoverHintProps) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="relative shrink-0"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-label={label}
        onClick={() => setOpen((current) => !current)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[var(--haven-edge)] text-[var(--haven-mute)] hover:text-[var(--haven-ink)]"
      >
        <InfoIcon />
      </button>
      {open ? (
        <div
          role="note"
          className="absolute right-0 z-30 mt-2 w-[min(20rem,calc(100vw-2rem))] space-y-3 rounded-md border border-[var(--haven-edge)] bg-[var(--haven-panel)] px-4 py-3 shadow-lg"
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}

export function HintLine({ title, body }: { title: string; body: string }) {
  return (
    <p className="text-xs leading-5 text-[var(--haven-ink)]">
      <span className="tracking-[0.12em] text-[var(--haven-brass)] uppercase">{title}</span>
      <span className="mt-1 block text-[var(--haven-mute)]">{body}</span>
    </p>
  );
}
