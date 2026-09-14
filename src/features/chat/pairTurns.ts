type RoleTurn = { id: string; role: "user" | "assistant" };

export type TurnPair<T extends RoleTurn> = {
  id: string;
  turns: T[];
};

export function pairTurns<T extends RoleTurn>(turns: T[]): TurnPair<T>[] {
  const pairs: TurnPair<T>[] = [];
  let current: T[] = [];

  for (const turn of turns) {
    if (turn.role === "user" && current.length > 0) {
      pairs.push({ id: current[0].id, turns: current });
      current = [turn];
      continue;
    }
    current.push(turn);
  }

  if (current.length) pairs.push({ id: current[0].id, turns: current });
  return pairs;
}
