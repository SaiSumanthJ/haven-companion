const STOP = new Set([
  "the", "and", "for", "you", "your", "that", "this", "with", "from", "have",
  "has", "had", "was", "were", "are", "been", "they", "them", "she", "him",
  "her", "his", "its", "not", "but", "just", "like", "about", "into", "over",
  "than", "then", "also", "very", "really", "actually", "name", "lives",
  "work", "named", "call", "called",
]);

function tokens(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length >= 3 && !STOP.has(word));
}

function factKeys(fact: string): string[] {
  const body = fact.includes(":") ? fact.slice(fact.indexOf(":") + 1) : fact;
  const keys = tokens(body);
  return keys.length ? keys : tokens(fact);
}

function haystack(text: string): string {
  return ` ${text.toLowerCase().replace(/[^a-z0-9\s]/g, " ")} `;
}

export function factMatchesText(fact: string, text: string): boolean {
  const keys = factKeys(fact);
  if (!keys.length || !text.trim()) return false;
  const blob = haystack(text);
  const hits = keys.filter((key) => blob.includes(` ${key} `));
  if (keys.some((key) => key.length >= 4 && hits.includes(key))) return true;
  if (keys.length === 1 && hits.length === 1) return true;
  return hits.length >= 2;
}

export function factsInText(facts: string[], text: string): string[] {
  return facts.filter((fact) => factMatchesText(fact, text));
}

export function salientFacts(facts: string[], texts: string[]): string[] {
  return factsInText(facts, texts.filter(Boolean).join("\n"));
}

export function factsUsed(facts: string[], userText: string, replyText: string): string[] {
  const seen = new Set<string>();
  for (const fact of [...factsInText(facts, userText), ...factsInText(facts, replyText)]) {
    seen.add(fact);
  }
  return facts.filter((fact) => seen.has(fact));
}
