const MAX_FACTS = 240;
const NAME_STOP = new Set(
  "a an the so just very not really actually also always already about still only even quite pretty more less too here there back done ready sorry fine okay ok good bad tired lonely going trying feeling having doing looking thinking working getting being making from at in to of as if or but and with for this that they them their you your we our its currently recently probably maybe perhaps gonna wanna yeah yes no hey hi hello well now then".split(
    " ",
  ),
);

export function isGivenName(raw: string): boolean {
  const name = raw.trim();
  if (!/^[A-Za-z][A-Za-z']{1,20}$/.test(name)) return false;
  const word = name.toLowerCase();
  return !NAME_STOP.has(word) && !/ly$/.test(word);
}

export function extractHeuristicFacts(userText: string): string[] {
  const text = userText.trim();
  if (text.length < 6) return [];
  const facts: string[] = [];

  const named =
    /(?:my name is|i(?:'m| am))\s+([A-Za-z][A-Za-z']{1,20})(?=\s+(?:and|but)\b|[.!?,]|$)/i.exec(
      text,
    );
  if (named?.[1] && isGivenName(named[1])) {
    facts.push(`Name: ${titleCase(named[1])}`);
  }

  const place =
    /(?:i live in|i(?:'m| am) from|i moved to)\s+([A-Za-z][A-Za-z\s.'-]{1,40}?)(?:[.!?,]|$)/i.exec(
      text,
    );
  if (place?.[1]) facts.push(`Lives in / from: ${cleanPhrase(place[1])}`);

  const work = /(?:i work (?:as|at|for)|my job is)\s+([^.]{2,50})/i.exec(text);
  if (work?.[1]) facts.push(`Work: ${cleanPhrase(work[1])}`);

  const have =
    /i have (?:a|an)\s+(dog|cat|son|daughter|brother|sister|wife|husband|girlfriend|boyfriend|partner|kid|child)(?:\s+named\s+([A-Za-z]+))?/i.exec(
      text,
    );
  if (have?.[1]) {
    const who = have[1].toLowerCase();
    facts.push(have[2] ? `Has a ${who} named ${titleCase(have[2])}` : `Has a ${who}`);
  }

  const age = /i(?:'m| am)\s+(\d{2})\s+years old/i.exec(text);
  if (age?.[1]) {
    const years = Number(age[1]);
    if (years >= 18 && years < 100) facts.push(`Age: ${years}`);
  }

  return facts;
}

export function mergeFacts(existing: string[], incoming: string[]): string[] {
  const next = [...existing];
  const seen = new Set(next.map(normalizeFact));
  for (const raw of incoming) {
    const fact = cleanFact(raw);
    if (!fact) continue;
    const key = normalizeFact(fact);
    if (seen.has(key)) continue;
    seen.add(key);
    next.push(fact);
  }
  return next.slice(0, MAX_FACTS);
}

export function unseenFacts(existing: string[], incoming: string[]): string[] {
  const known = new Set(existing.map(normalizeFact));
  return mergeFacts([], incoming).filter((fact) => !known.has(normalizeFact(fact)));
}

export function stackSuggestions(
  known: string[],
  latest: string[],
  older: string[],
): string[] {
  const fresh = unseenFacts(known, latest);
  const rest = unseenFacts([...known, ...fresh], older);
  return [...fresh, ...rest].slice(0, 24);
}

export const RECENT_SUGGESTION_BATCHES = 3;

export function splitSuggestionGroups<T extends { facts: string[] }>(
  known: string[],
  batches: T[] | undefined,
): { recent: T[]; past: T[] } {
  const clean = (batches ?? [])
    .map((batch) => ({ ...batch, facts: unseenFacts(known, batch.facts) }))
    .filter((batch) => batch.facts.length > 0);
  return {
    recent: clean.slice(0, RECENT_SUGGESTION_BATCHES),
    past: clean.slice(RECENT_SUGGESTION_BATCHES),
  };
}

export function splitSuggestionLists(
  known: string[],
  batches: Array<{ facts: string[] }> | undefined,
): { recent: string[]; past: string[] } {
  const { recent, past } = splitSuggestionGroups(known, batches);
  const top = unseenFacts([], recent.flatMap((batch) => batch.facts));
  return {
    recent: top,
    past: unseenFacts([], past.flatMap((batch) => batch.facts)).filter(
      (fact) => !top.includes(fact),
    ),
  };
}

function cleanFact(raw: string): string | null {
  const fact = raw.replace(/^[-*]\s+/, "").replace(/^["']|["']$/g, "").trim();
  if (fact.length < 4 || fact.length > 140) return null;
  if (/https?:\/\//i.test(fact)) return null;
  const named = /^name:\s*(.+)$/i.exec(fact);
  if (named && !isGivenName(named[1])) return null;
  return fact;
}

function normalizeFact(fact: string): string {
  return fact.toLowerCase().replace(/\s+/g, " ").trim();
}

function cleanPhrase(value: string): string {
  return value.replace(/\s+/g, " ").trim().replace(/[.,;:]+$/, "");
}

function titleCase(value: string): string {
  return value[0].toUpperCase() + value.slice(1);
}
