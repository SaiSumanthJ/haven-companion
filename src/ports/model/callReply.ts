const LABEL = "(from a voice call, kept short on purpose.)";
const FULL = /\(?From a voice call, kept short on purpose\.?\)?\s*/gi;
const BREAK = /(?:\.{3}|…+|[.!?]+)["'“”‘’)\]]*(?:\s+|$)|(?:\n+)/g;

function tidy(text: string): string {
  return text
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function isLabelFragment(text: string): boolean {
  const bit = tidy(text).replace(/\s+/g, " ").toLowerCase();
  if (bit.length < 8) return false;
  return LABEL.startsWith(bit) || bit.startsWith("(from a voice call");
}

export function stripCallLeak(text: string): string {
  let out = tidy(text.replace(FULL, " "));
  if (!out || isLabelFragment(out)) return "";
  if (/^\(?from a voice call/i.test(out)) {
    out = tidy(
      out.replace(/^\(?from a voice call(?:, kept short(?: on(?: purpose)?)?)?\.?\)?\s*/i, ""),
    );
  }
  return isLabelFragment(out) ? "" : out;
}

export function takeSpokenSentences(text: string): { ready: string[]; rest: string } {
  const src = tidy(text);
  if (!src) return { ready: [], rest: "" };
  const ready: string[] = [];
  let last = 0;
  const end = new RegExp(BREAK.source, "g");
  let match = end.exec(src);
  while (match) {
    const piece = src.slice(last, match.index + match[0].length).replace(/\s+/g, " ").trim();
    if (piece) ready.push(piece);
    last = match.index + match[0].length;
    match = end.exec(src);
  }
  const rest = src.slice(last).replace(/\s+/g, " ").trim();
  return { ready, rest };
}

export function callSentences(text: string): string[] {
  const { ready, rest } = takeSpokenSentences(stripCallLeak(text));
  return rest ? [...ready, rest] : ready;
}

export const CALL_SENTENCE_CAP = 5;

export function callReplyComplete(text: string): boolean {
  return takeSpokenSentences(stripCallLeak(text)).ready.length >= CALL_SENTENCE_CAP;
}

export function finishCallReply(text: string): string {
  const cleaned = stripCallLeak(text);
  if (!cleaned) return "";
  return callSentences(cleaned).slice(0, CALL_SENTENCE_CAP).join(" ");
}
