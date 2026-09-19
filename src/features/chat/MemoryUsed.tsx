"use client";

import { HoverHint } from "@/features/chat/HoverHint";

type MemoryUsedProps = {
  facts: string[];
};

export function MemoryUsed({ facts }: MemoryUsedProps) {
  if (facts.length === 0) return null;
  return (
    <HoverHint label="Saved memory used in this line" compact>
      <p className="text-xs tracking-[0.12em] text-[var(--haven-brass)] uppercase">
        Used from saved memory
      </p>
      <ul className="space-y-2">
        {facts.map((fact) => (
          <li key={fact} className="text-xs leading-5 text-[var(--haven-mute)]">
            {fact}
          </li>
        ))}
      </ul>
    </HoverHint>
  );
}
