import type { ReactNode } from "react";

type TurnHeadProps = {
  label: string;
  tone?: "you" | "them";
  children?: ReactNode;
};

export function TurnHead({ label, tone = "them", children }: TurnHeadProps) {
  const color = tone === "you" ? "text-[var(--haven-ink)]" : "text-[var(--haven-brass)]";
  return (
    <div className="flex items-center justify-between gap-3">
      <p className={`text-xs tracking-[0.16em] uppercase ${color}`}>{label}</p>
      {children ? <div className="flex shrink-0 flex-wrap justify-end gap-2">{children}</div> : null}
    </div>
  );
}
