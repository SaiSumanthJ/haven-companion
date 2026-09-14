"use client";

import { HintLine, HoverHint } from "@/features/chat/HoverHint";

type RoomGuideProps = {
  companionName: string;
  factCount: number;
  healthDetail?: string;
};

const LINES = [
  ["This room", "Haven is AI, not a person, and not therapy. Memory stays on this device. Nothing here asks you to stay."],
  ["Menu", "Rooms, the name, how they know you, voice, saved facts, and This device."],
  ["Write", "Enter sends. Shift+Enter is a new line. Edit a You line to restart from there."],
  ["Attach", "Pictures, documents, or a short clip. Read on this computer. Up to three files."],
  ["Voice", "Fills the box. You still press Send."],
  ["Call", "Call starts the first take. After they answer, press Talk, then Done talking. End in the grid stops the voice."],
  ["A long talk", "Still software. A walk, a friend, or a pause still counts."],
] as const;

export function RoomGuide({ companionName, factCount, healthDetail }: RoomGuideProps) {
  return (
    <HoverHint label="How this room works">
      {factCount > 0 ? (
        <p className="text-xs leading-5 text-[var(--haven-mute)]">
          {companionName} still has {factCount} saved {factCount === 1 ? "fact" : "facts"}.
        </p>
      ) : null}
      {healthDetail ? (
        <p className="text-xs leading-5 text-[var(--haven-mute)]">{healthDetail}</p>
      ) : null}
      {LINES.map(([title, body]) => (
        <HintLine key={title} title={title} body={body} />
      ))}
    </HoverHint>
  );
}
