export type TalkMode = "type" | "hear" | "call";

const LABEL: Record<TalkMode, string> = {
  type: "Typed",
  hear: "Hearing",
  call: "Call",
};

type TalkShiftProps = {
  mode: TalkMode;
  flash: boolean;
};

export function TalkShift({ mode, flash }: TalkShiftProps) {
  return (
    <div
      className={`haven-talk-shift${flash ? " is-shift" : ""}`}
      data-mode={mode}
      aria-live="polite"
    >
      <i className="haven-shift-type" aria-hidden />
      <i className="haven-shift-hear" aria-hidden />
      <i className="haven-shift-call" aria-hidden />
      <b>{LABEL[mode]}</b>
    </div>
  );
}
