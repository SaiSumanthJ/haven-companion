import { blocksFromRoom, type RoomMark } from "@/features/chat/roomText";

function Marks({ marks }: { marks: RoomMark[] }) {
  return marks.map((mark, index) => {
    if (mark.bold) {
      return (
        <strong key={index} className="font-semibold text-[var(--haven-ink)]">
          {mark.text}
        </strong>
      );
    }
    if (mark.italic) {
      return <em key={index}>{mark.text}</em>;
    }
    return <span key={index}>{mark.text}</span>;
  });
}

export function CompanionText({ text }: { text: string }) {
  const blocks = blocksFromRoom(text);
  if (blocks.length === 0) return null;
  return (
    <div className="space-y-3 text-[0.975rem] leading-7 text-[var(--haven-ink)]">
      {blocks.map((block, index) => {
        if (block.kind === "h") {
          return (
            <p
              key={index}
              className="font-semibold tracking-wide text-[var(--haven-brass)]"
            >
              <Marks marks={block.marks} />
            </p>
          );
        }
        if (block.kind === "list") {
          return (
            <ul key={index} className="list-disc space-y-1 pl-5">
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}>
                  <Marks marks={item} />
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p key={index}>
            <Marks marks={block.marks} />
          </p>
        );
      })}
    </div>
  );
}
