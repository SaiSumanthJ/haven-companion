import { CompanionText } from "@/features/chat/CompanionText";
import { CopyLine } from "@/features/chat/CopyLine";
import { TurnHead } from "@/features/chat/TurnHead";

type ReplyTurnProps = {
  text: string;
  live?: boolean;
};

export function ReplyTurn({ text, live }: ReplyTurnProps) {
  return (
    <div className="space-y-2">
      <TurnHead label="Companion" tone="them">
        {live ? null : <CopyLine text={text} />}
      </TurnHead>
      <div className="haven-said haven-said-them">
        <CompanionText text={text} />
      </div>
    </div>
  );
}
