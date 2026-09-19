import type { ReactNode } from "react";

type SidebarSectionProps = {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
};

export function SidebarSection({ title, open, onToggle, children }: SidebarSectionProps) {
  return (
    <div className="border-b border-[var(--haven-edge)]">
      <button
        type="button"
        aria-expanded={open}
        onClick={onToggle}
        className="flex w-full items-center justify-between py-3 text-left text-sm text-[var(--haven-ink)]"
      >
        <span>{title}</span>
        <span
          aria-hidden
          className={`text-lg leading-none text-[var(--haven-mute)] transition-transform duration-300 ease-out ${
            open ? "rotate-45" : "rotate-0"
          }`}
        >
          +
        </span>
      </button>
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className={`pb-3 ${open ? "haven-reveal" : ""}`}>{children}</div>
        </div>
      </div>
    </div>
  );
}
