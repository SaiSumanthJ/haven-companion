import { boxBtn, quietBtn } from "@/features/chat/quietBtn";
import { useState } from "react";

type CompanionNameProps = {
  name: string;
  onRename: (name: string) => void;
};

export function CompanionName({ name, onRename }: CompanionNameProps) {
  const [renaming, setRenaming] = useState(false);
  const [draft, setDraft] = useState(name);

  if (!renaming) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-[var(--haven-ink)]">{name}</p>
        <button
          type="button"
          onClick={() => {
            setDraft(name);
            setRenaming(true);
          }}
          className={quietBtn}
        >
          Rename
        </button>
      </div>
    );
  }

  return (
    <form
      className="flex flex-col gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        onRename(draft.trim() || name);
        setRenaming(false);
      }}
    >
      <input
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        aria-label="Companion name"
        className="h-10 rounded-md border border-[var(--haven-edge)] bg-[var(--haven-panel)] px-3 text-sm text-[var(--haven-ink)] outline-none"
      />
      <button
        type="submit"
        className={boxBtn}
      >
        Save name
      </button>
    </form>
  );
}
