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
