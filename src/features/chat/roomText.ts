export type RoomMark = { text: string; bold?: boolean; italic?: boolean };
export type RoomBlock =
  | { kind: "p"; marks: RoomMark[] }
  | { kind: "h"; marks: RoomMark[] }
  | { kind: "list"; items: RoomMark[][] };

export function marksFromLine(line: string): RoomMark[] {
  const mark = /\*\*([^*]+)\*\*|__([^_]+)__|\*([^*]+)\*/g;
  const out: RoomMark[] = [];
  let last = 0;
  let match = mark.exec(line);
  while (match) {
    if (match.index > last) out.push({ text: line.slice(last, match.index) });
    if (match[1] || match[2]) out.push({ text: match[1] || match[2], bold: true });
    else out.push({ text: match[3], italic: true });
    last = match.index + match[0].length;
    match = mark.exec(line);
  }
  if (last < line.length) out.push({ text: line.slice(last) });
  return out.filter((part) => part.text);
}

export function prepareRoomText(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/([.!?])\s+(\*\*[^*]{1,80}\*\*)/g, "$1\n\n$2")
    .replace(/^(\*\*[^*]{1,80}\*\*)\s+/gm, "$1\n")
    .trim();
}

function listItem(line: string): string | null {
  const match = line.match(/^(?:[-*]|(\d+)\.)\s+(.+)$/);
  return match ? match[2] : null;
}

function headingLine(line: string): string | null {
  if (/^#{1,3}\s+\S/.test(line)) return line.replace(/^#{1,3}\s+/, "");
  if (/^\*\*[^*]+\*\*$/.test(line)) return line.slice(2, -2);
  return null;
}

export function blocksFromRoom(text: string): RoomBlock[] {
  const chunks = prepareRoomText(text)
    .split(/\n\s*\n/)
    .map((chunk) => chunk.trim())
    .filter(Boolean);
  const out: RoomBlock[] = [];
  for (const chunk of chunks) {
    const lines = chunk
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    for (const line of lines) {
      const heading = headingLine(line);
      if (heading) {
        out.push({ kind: "h", marks: marksFromLine(heading) });
        continue;
      }
      const item = listItem(line);
      if (item) {
        const last = out.at(-1);
        if (last?.kind === "list") last.items.push(marksFromLine(item));
        else out.push({ kind: "list", items: [marksFromLine(item)] });
        continue;
      }
      out.push({ kind: "p", marks: marksFromLine(line) });
    }
  }
  return out;
}
