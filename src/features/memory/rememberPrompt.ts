export function buildRememberPrompt(input: {
  knownFacts: string[];
  recentLines: string[];
  roomLines: string[];
  existingSummary: string;
}): string {
  const known =
    input.knownFacts.length > 0
      ? input.knownFacts.map((fact) => `- ${fact}`).join("\n")
      : "- None yet.";
  const recent = input.recentLines.join("\n") || "- None.";
  const room = input.roomLines.join("\n") || "- None.";

  return [
    "You write durable memory for Haven. Return ONLY JSON: {\"facts\":[\"...\"],\"summary\":\"...\"}",
    "facts: max 8 short strings, ONLY from Latest lines, about the user's lasting life.",
    "Skip greetings, one-off moods, erotic blow-by-blow, and anything sexual involving a minor.",
    "Do not repeat facts already known.",
    "summary: one reconstruction brief of THIS ROOM. One rule for every room and every setup.",
    "A stranger given only this brief, the companion name, and saved facts should continue the room as if they had read the transcript.",
    "Do not mention setup chips (age band, gender, country, pace, talk style, and the rest). Write only what was said and done here.",
    "Fold Current brief + Room lines + Latest lines into ONE replacement brief. Do not append a diary. Do not invent. If a detail is missing, omit it.",
    "Always cover these, in this order, when the room has them. Skip a heading only if empty:",
    "BOND — how they are with each other here, from speech not forms.",
    "NAMES — what they call each other.",
    "STORY — concrete events in time order: places, third parties, callbacks, plans.",
    "OPEN — unanswered questions, unfinished scenes, promised next steps.",
    "FIXED — corrections the user made.",
    "EDGES — boundaries they set here.",
    "NOW — temperature of the latest stretch. Adult scenes: one factual line so the room can resume; no erotic transcript.",
    "Dense, 120–220 words. No greeting filler. Empty string only if there are no user lines yet.",
    "Facts already known:",
    known,
    input.existingSummary ? `Current brief:\n${input.existingSummary}` : "Current brief:\n- None.",
    "Room lines (this room, oldest of this window first):",
    room,
    "Latest lines:",
    recent,
  ]
    .filter(Boolean)
    .join("\n");
}
