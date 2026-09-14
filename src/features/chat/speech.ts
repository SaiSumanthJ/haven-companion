export function joinSpoken(current: string, spoken: string): string {
  const next = spoken.trim();
  if (!next) return current;
  if (!current.trim()) return next;
  const spacer = /\s$/.test(current) ? "" : " ";
  return `${current}${spacer}${next}`;
}
