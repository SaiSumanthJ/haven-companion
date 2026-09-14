import { boxBtn } from "@/features/chat/quietBtn";
import type { HavenChat } from "@/features/memory/types";
import { MAX_CHATS } from "@/features/memory/types";

type ChatListProps = {
  chats: HavenChat[];
  activeChatId: string;
  onSelect: (chatId: string) => void;
  onNew: () => void;
};

export function ChatList({ chats, activeChatId, onSelect, onNew }: ChatListProps) {
  const rooms = chats ?? [];
  return (
    <div className="space-y-3">
      <ul className="space-y-1">
        {rooms.map((chat) => (
          <li key={chat.id}>
            <button
              type="button"
              onClick={() => onSelect(chat.id)}
              className={`w-full rounded-md px-3 py-2 text-left text-sm ${
                chat.id === activeChatId
                  ? "bg-[var(--haven-panel)] text-[var(--haven-ink)]"
                  : "text-[var(--haven-mute)]"
              }`}
            >
              {chat.title}
            </button>
          </li>
        ))}
      </ul>
      <button
        type="button"
        disabled={rooms.length >= MAX_CHATS}
        onClick={onNew}
        className={boxBtn}
      >
        New chat
      </button>
    </div>
  );
}
