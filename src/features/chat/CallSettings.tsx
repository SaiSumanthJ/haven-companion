import { quietBtn } from "@/features/chat/quietBtn";
import { ChoiceRow } from "@/features/companion/ChoiceRow";
import { CALL_RATES, type CallPrefs, type VoiceChoice } from "@/features/voice/callSpeech";

type CallSettingsProps = {
  prefs: CallPrefs;
  voices: VoiceChoice[];
  onChange: (next: CallPrefs) => void;
  onPreview: () => void;
};

export function CallSettings({ prefs, voices, onChange, onPreview }: CallSettingsProps) {
  return (
    <div className="space-y-4">
      <label className="block space-y-2 text-sm text-[var(--haven-mute)]">
        Voice
        <select
          value={prefs.voiceURI}
          onChange={(event) => onChange({ ...prefs, voiceURI: event.target.value })}
          className="mt-2 h-11 w-full rounded-md border border-[var(--haven-edge)] bg-[var(--haven-panel)] px-3 text-[var(--haven-ink)] outline-none"
        >
          {voices.length === 0 ? (
            <option value="">No offline voices on this computer</option>
          ) : (
            voices.map((voice) => (
              <option key={voice.voiceURI} value={voice.voiceURI}>
                {voice.name} ({voice.lang})
              </option>
            ))
          )}
        </select>
      </label>
      <ChoiceRow
        label="Speed"
        value={prefs.rate}
        options={CALL_RATES.map((item) => ({ id: item.id, label: item.label }))}
        onChange={(rate) => onChange({ ...prefs, rate })}
      />
      <ChoiceRow
        label="How you talk"
        value={prefs.hands}
        options={[
          { id: "manual", label: "Press Talk, then Done talking" },
          { id: "auto", label: "Automatic — I take the pause" },
        ]}
        onChange={(hands) => onChange({ ...prefs, hands })}
      />
      <ChoiceRow
        label="After they finish speaking"
        value={prefs.listenAgain ? "again" : "wait"}
        options={[
          { id: "again", label: "Listen again" },
          { id: "wait", label: "Wait for me" },
        ]}
        onChange={(listen) => onChange({ ...prefs, listenAgain: listen === "again" })}
      />
      <button
        type="button"
        onClick={onPreview}
        className={quietBtn}
      >
        Preview this voice
      </button>
    </div>
  );
}
