"use client";

import { useRef } from "react";

type Choice<T extends string> = { id: T; label: string };

export type ChoiceGroup<T extends string> = {
  title?: string;
  options: Choice<T>[];
};

type ChoiceRowProps<T extends string> = {
  label: string;
  value: T;
  options?: Choice<T>[];
  groups?: ChoiceGroup<T>[];
  onChange: (next: T) => void;
};

function asGroups<T extends string>(
  options: Choice<T>[] | undefined,
  groups: ChoiceGroup<T>[] | undefined,
): ChoiceGroup<T>[] {
  if (groups?.length) return groups;
  const list = options ?? [];
  const main = list.filter((item) => item.id !== "skip");
  const skip = list.filter((item) => item.id === "skip");
  return skip.length ? [{ options: main }, { options: skip }] : [{ options: main }];
}

function columns(group: ChoiceGroup<string>): string {
  if (group.options.length <= 1) return "grid-cols-1";
  if (group.options.length === 4 || group.options.every((item) => item.label.length <= 16)) {
    return "grid-cols-2";
  }
  return "grid-cols-1";
}

export function ChoiceRow<T extends string>({
  label,
  value,
  options,
  groups,
  onChange,
}: ChoiceRowProps<T>) {
  const box = useRef<HTMLDetailsElement>(null);
  const current =
    [...(groups ?? []), { options: options ?? [] }]
      .flatMap((group) => group.options)
      .find((item) => item.id === value)?.label ?? "Skip";

  function pick(next: T) {
    onChange(next);
    if (box.current) box.current.open = false;
  }

  return (
    <details
      ref={box}
      className="haven-draw rounded-md border border-[var(--haven-edge)] bg-[var(--haven-panel)] px-3 py-2"
    >
      <summary className="cursor-pointer list-outside text-sm text-[var(--haven-ink)]">
        <span className="text-[var(--haven-mute)]">{label}</span>
        <span className="ml-2 text-[var(--haven-brass)]">{current}</span>
      </summary>
      <div className="haven-draw-body mt-3 space-y-3">
        {asGroups(options, groups).map((group, index) => (
          <div key={group.title ?? String(index)} className="space-y-2">
            {group.title ? (
              <p className="text-[11px] tracking-[0.16em] text-[var(--haven-mute)] uppercase">
                {group.title}
              </p>
            ) : null}
            <div className={`grid gap-2 ${columns(group)}`}>
              {group.options.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => pick(option.id)}
                    className={`min-h-11 rounded-md border px-2.5 py-2 text-left text-[13px] leading-5 whitespace-nowrap ${
                    value === option.id
                      ? "border-[var(--haven-brass)] text-[var(--haven-ink)]"
                      : "border-[var(--haven-edge)] text-[var(--haven-mute)]"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </details>
  );
}
