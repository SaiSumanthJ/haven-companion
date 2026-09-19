type CrisisCardProps = {
  text: string;
};

export function CrisisCard({ text }: CrisisCardProps) {
  return (
    <aside className="haven-crisis-in rounded-md border border-[var(--haven-crisis-edge)] bg-[var(--haven-crisis-fill)] px-4 py-3 text-sm leading-6 text-[var(--haven-ink)]">
      {text}
    </aside>
  );
}
