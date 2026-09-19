import { PhoneIcon } from "@/features/chat/ActionIcon";

type CallButtonProps = {
  active: boolean;
  supported: boolean;
  disabled: boolean;
  onClick: () => void;
};

export function CallButton({ active, supported, disabled, onClick }: CallButtonProps) {
  return (
    <span className={`haven-act-call${active ? " is-on" : ""}`}>
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || !supported}
      aria-pressed={active}
      aria-label={active ? "End voice call" : "Start voice call"}
      title={supported ? (active ? "End the call" : "Call") : "Call needs a microphone"}
      className={`inline-flex h-12 w-full items-center justify-center gap-2 rounded-md px-3 text-sm font-medium ${
        active
          ? "bg-[var(--haven-brass)] text-[var(--haven-night)]"
          : "border border-[var(--haven-edge)] text-[var(--haven-ink)]"
      } disabled:opacity-40`}
    >
      <PhoneIcon />
      {active ? "End" : "Call"}
    </button>
    </span>
  );
}
