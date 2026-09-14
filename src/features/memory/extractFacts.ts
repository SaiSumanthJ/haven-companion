const MAX_FACTS = 80;

export function extractHeuristicFacts(userText: string): string[] {
  const text = userText.trim();
  if (text.length < 6) return [];
  const facts: string[] = [];

  const named = /(?:my name is|i(?:'m| am))\s+([A-Za-z][a-zA-Z]{1,20})\b/i.exec(text);
  if (named?.[1] && !/^(a|an|the|so|just|very|not|really)\b/i.test(named[1])) {
    const name = named[1][0].toUpperCase() + named[1].slice(1);
    facts.push(`Name: ${name}`);
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

export function parseFactList(raw: string): string[] {
  const start = raw.indexOf("[");
  const end = raw.lastIndexOf("]");
  if (start < 0 || end <= start) return [];
  try {
    const parsed = JSON.parse(raw.slice(start, end + 1)) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === "string");
  } catch {
    return [];
  }
}

export function parseRememberPayload(raw: string): { facts: string[]; summary: string } {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start >= 0 && end > start) {
    try {
      const parsed = JSON.parse(raw.slice(start, end + 1)) as {
        facts?: unknown;
        summary?: unknown;
      };
      return {
        facts: Array.isArray(parsed.facts)
          ? parsed.facts.filter((item): item is string => typeof item === "string")
          : [],
        summary: typeof parsed.summary === "string" ? parsed.summary : "",
      };
    } catch {
      return { facts: parseFactList(raw), summary: "" };
    }
  }
  return { facts: parseFactList(raw), summary: "" };
}

function cleanFact(raw: string): string | null {
  const fact = raw.replace(/^[-*]\s+/, "").replace(/^["']|["']$/g, "").trim();
  if (fact.length < 4 || fact.length > 140) return null;
  if (/https?:\/\//i.test(fact)) return null;
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
