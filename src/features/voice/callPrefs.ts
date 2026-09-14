import { emptyCallPrefs, parseCallPrefs, type CallPrefs } from "@/features/voice/callSpeech";

export const CALL_PREFS_KEY = "haven.call.v1";
export const CALL_PREFS_EVENT = "haven-call-prefs";

export function loadCallPrefs(): CallPrefs {
  if (typeof window === "undefined") return emptyCallPrefs();
  try {
    const raw = window.localStorage.getItem(CALL_PREFS_KEY);
    if (!raw) return emptyCallPrefs();
    return parseCallPrefs(JSON.parse(raw) as unknown);
  } catch {
    return emptyCallPrefs();
  }
}

export function saveCallPrefs(prefs: CallPrefs): void {
  window.localStorage.setItem(CALL_PREFS_KEY, JSON.stringify(prefs));
  window.dispatchEvent(new CustomEvent(CALL_PREFS_EVENT, { detail: prefs }));
}
