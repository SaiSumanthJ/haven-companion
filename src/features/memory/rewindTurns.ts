export function turnsBeforePrompt<T extends { id: string; role: string }>(
  turns: T[],
  turnId: string,
): T[] | null {
  const index = turns.findIndex((turn) => turn.id === turnId);
  if (index < 0 || turns[index]?.role !== "user") return null;
  return turns.slice(0, index);
}
