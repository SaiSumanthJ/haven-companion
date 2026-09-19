import { jumpToTalk } from "@/features/chat/talkJump";

type TalkMarkProps = {
  n?: number;
};

export function TalkMark({ n }: TalkMarkProps) {
  if (n == null) return null;
  return (
    <button
      type="button"
      className="haven-talk-n"
      aria-label={`Jump to talk ${n}`}
      title={`Talk ${n}`}
      onClick={() => jumpToTalk(n)}
    >
      {n}
    </button>
  );
}
