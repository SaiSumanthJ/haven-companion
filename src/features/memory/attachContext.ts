import type { AttachmentNote, MemoryTurn } from "./types";

export const ATTACH_MARK = "--- Attached";
const RECENT = 2;
const CAP = 3500;

export function sharedLabel(notes: AttachmentNote[]): string {
  if (notes.length === 1) return `Shared ${notes[0].name}.`;
  return `Shared ${notes.length} files.`;
}

export function readingForModel(notes: AttachmentNote[] | undefined, recent: boolean): string {
  if (!notes?.length) return "";
  if (!recent) {
    return notes.map((note) => `(They shared ${note.name} earlier.)`).join(" ");
  }
  return notes
    .map((note) => {
      const body = note.reading.replace(/\s+/g, " ").trim().slice(0, CAP);
      return `${ATTACH_MARK} ${note.kind}: ${note.name} ---\n${body || "(No readable text. Look at any attached picture.)"}`;
    })
    .join("\n\n");
}

export function contentWithAttachments(
  content: string,
  turn: MemoryTurn,
  indexFromEnd: number,
  pace: "chat" | "call",
): string {
  if (pace === "call") return content;
  const extra = readingForModel(turn.attachments, indexFromEnd < RECENT);
  return extra ? `${content}\n\n${extra}` : content;
}
