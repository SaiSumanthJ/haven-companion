export type SafetyDecision =
  | { kind: "allow" }
  | { kind: "crisis"; resource: string }
  | { kind: "refuse"; reason: string };

const CRISIS =
  /(?:\b(kill myself|suicide|end my life|want to die|self[- ]harm|cut myself)\b)/i;

const YOUNG =
  /\b(child|children|kid|kids|toddler|preteen|underage|minor)\b/i;
const SEXUAL = /\b(sex|sexual|nude|porn|erotic)\b/i;
const CLAIMED_MINOR = /\b(i(?:'m| am)|i'm)\s*(1[0-7]|[1-9])\b/i;

function looksMinorSexual(text: string): boolean {
  const youngThenSex = new RegExp(`${YOUNG.source}.{0,40}${SEXUAL.source}`, "i");
  const sexThenYoung = new RegExp(`${SEXUAL.source}.{0,40}${YOUNG.source}`, "i");
  return youngThenSex.test(text) || sexThenYoung.test(text) || CLAIMED_MINOR.test(text);
}

function looksRealPersonSexual(text: string): boolean {
  if (!SEXUAL.test(text)) return false;
  return /\b(impersonat(?:e|ing)|as a real (?:person|celebrity)|a real (?:person|celebrity)|actually named)\b/i.test(
    text,
  );
}

const CSAM = /(?:\b(csam|child porn|child pornography)\b)/i;

export function reviewUserText(text: string): SafetyDecision {
  const trimmed = text.trim();
  if (CSAM.test(trimmed) || looksMinorSexual(trimmed) || looksRealPersonSexual(trimmed)) {
    return {
      kind: "refuse",
      reason:
        "Haven will not engage with sexual content involving anyone 17 or under, child sexual material, or sexual impersonation of a real private person.",
    };
  }
  if (CRISIS.test(trimmed)) {
    return {
      kind: "crisis",
      resource:
        "If you are in immediate danger, call local emergency services. In the US and Canada, call or text 988. In the UK, call 111 or Samaritans at 116 123. In Australia, call Lifeline at 13 11 14.",
    };
  }
  return { kind: "allow" };
}

export const AI_DISCLOSURE =
  "Haven is software. The companion is an AI, not a person, and cannot feel human emotion.";
