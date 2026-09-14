const LABEL = "(from a voice call, kept short on purpose.)";
const FULL = /\(?From a voice call, kept short on purpose\.?\)?\s*/gi;

function compact(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function isLabelFragment(text: string): boolean {
  const bit = compact(text).toLowerCase();
  if (bit.length < 8) return false;
  return LABEL.startsWith(bit) || bit.startsWith("(from a voice call");
}

export function stripLeakedCallLabel(text: string): string {
  let out = compact(text.replace(FULL, " "));
  if (!out || isLabelFragment(out)) return "";
  if (/^\(?from a voice call/i.test(out)) {
    out = compact(
      out.replace(/^\(?from a voice call(?:, kept short(?: on(?: purpose)?)?)?\.?\)?\s*/i, ""),
    );
  }
  return isLabelFragment(out) ? "" : out;
}

export function contentForModel(
  content: string,
  _via: "chat" | "call" | undefined,
  _pace: "chat" | "call",
): string {
  return stripLeakedCallLabel(content);
}
