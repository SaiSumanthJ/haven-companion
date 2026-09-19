const FEATURES = ["Owned memory", "On this computer", "Voice and talk", "Yours to keep"] as const;

export function HavenMark() {
  return (
    <div className="haven-mark-wrap">
      <div className="haven-mark-halo" aria-hidden="true" />
      <div className="haven-mark-orbit" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </div>
      <p className="haven-mark">Haven</p>
      <p className="haven-mark-features">
        {FEATURES.map((line) => (
          <span key={line}>{line}</span>
        ))}
      </p>
    </div>
  );
}
