import type { AttachmentNote } from "@/features/memory/types";

export function AttachChips({ notes }: { notes?: AttachmentNote[] }) {
  if (!notes?.length) return null;
  return (
    <ul className="flex flex-wrap gap-2">
      {notes.map((note) => (
        <li
          key={`${note.kind}-${note.name}`}
          className="rounded-md border border-[var(--haven-edge)] px-2 py-1 text-xs text-[var(--haven-mute)]"
        >
          {note.name}
        </li>
      ))}
    </ul>
  );
}
