export function talkPaneId(n: number): string {
  return `haven-talk-${n}`;
}

export function jumpToTalk(n: number): void {
  const pane = document.getElementById(talkPaneId(n));
  if (!pane) return;
  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  pane.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
}
