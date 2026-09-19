"use client";

import { InfoIcon } from "@/features/chat/ActionIcon";
import { useRef, useState, type ReactNode } from "react";

type HoverHintProps = {
  label: string;
  children: ReactNode;
  compact?: boolean;
};

export function HoverHint({ label, children, compact }: HoverHintProps) {
  const [open, setOpen] = useState(false);
  const pinned = useRef(false);

  return (
    <div
      className="relative shrink-0"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => {
        if (!pinned.current) setOpen(false);
      }}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-label={label}
        onClick={() => {
          pinned.current = !pinned.current;
          setOpen(pinned.current);
        }}
        className={`inline-flex items-center justify-center rounded-md border border-[var(--haven-edge)] text-[var(--haven-mute)] hover:text-[var(--haven-ink)] ${
          compact ? "h-7 w-7" : "h-9 w-9"
        }`}
      >
        <InfoIcon />
      </button>
      {open ? (
        <div
          role="note"
          className="haven-hint absolute right-0 z-30 mt-2 w-[min(20rem,calc(100vw-2rem))] space-y-3 rounded-md border border-[var(--haven-edge)] bg-[var(--haven-panel)] px-4 py-3 shadow-lg"
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
