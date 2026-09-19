import { CompanionText } from "@/features/chat/CompanionText";
import { CopyLine } from "@/features/chat/CopyLine";
import { MemoryUsed } from "@/features/chat/MemoryUsed";
import { TurnHead } from "@/features/chat/TurnHead";

type ReplyTurnProps = {
  text: string;
  live?: boolean;
  usedFacts?: string[];
};

export function ReplyTurn({ text, live, usedFacts }: ReplyTurnProps) {
  return (
    <div className="space-y-2">
      <TurnHead label="Companion" tone="them">
        {usedFacts?.length ? <MemoryUsed facts={usedFacts} /> : null}
        {live ? null : <CopyLine text={text} />}
      </TurnHead>
      <div className={`haven-said haven-said-them${live ? " haven-said-live" : ""}`}>
        <CompanionText text={text} />
      </div>
    </div>
  );
}
