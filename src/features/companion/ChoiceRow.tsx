type Choice<T extends string> = { id: T; label: string };

type ChoiceRowProps<T extends string> = {
  label: string;
  value: T;
  options: Choice<T>[];
  onChange: (next: T) => void;
};

export function ChoiceRow<T extends string>({
  label,
  value,
  options,
  onChange,
}: ChoiceRowProps<T>) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm text-[var(--haven-mute)]">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={`rounded-md border px-3 py-1.5 text-sm ${
              value === option.id
                ? "border-[var(--haven-brass)] text-[var(--haven-ink)]"
                : "border-[var(--haven-edge)] text-[var(--haven-mute)]"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
