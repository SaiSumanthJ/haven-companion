"use client";

import { boxBtn } from "@/features/chat/quietBtn";
import { useEffect, useState } from "react";

type OllamaOffer = { name: string; label: string; tight: boolean };
type WhisperOffer = { id: string; label: string; note: string; cached: boolean };

type Catalog = {
  chat: string | null;
  call: string | null;
  whisper: string;
  ollama: OllamaOffer[];
  whisperOffers: WhisperOffer[];
  using?: { chat: string; call: string };
};

type LocalModelsProps = {
  onChanged: () => void;
};

export function LocalModels({ onChanged }: LocalModelsProps) {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [note, setNote] = useState("");

  async function reload() {
    const response = await fetch("/api/models");
    if (!response.ok) throw new Error("Could not read the models on this computer.");
    setCatalog((await response.json()) as Catalog);
  }

  useEffect(() => {
    void reload().catch((error: unknown) => {
      setNote(error instanceof Error ? error.message : "Could not read the models on this computer.");
    });
  }, []);

  async function save(patch: { chatModel?: string | null; callModel?: string | null; whisperModel?: string | null }) {
    setNote("Saving…");
    const response = await fetch("/api/models", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    const payload = (await response.json()) as { ok?: boolean; error?: string; using?: Catalog["using"] };
    if (!response.ok || payload.ok === false) {
      setNote(payload.error ?? "That pick could not be saved.");
      return;
    }
    await reload();
    onChanged();
    const using = payload.using;
    setNote(
      using
        ? `Saved. Typed chat uses ${using.chat}. Call uses ${using.call}.`
        : "Saved. The next message or take uses this pick.",
    );
  }

  if (!catalog) {
    return <p className="text-sm text-[var(--haven-mute)]">{note || "Reading installed models…"}</p>;
  }

  return (
    <div className="space-y-4 text-sm">
      <p className="text-xs leading-5 text-[var(--haven-mute)]">
        These lists are what is already on this computer. Text to text and Call keep their own
        picks — changing one does not change the other. Speaking voice still lives under Voice
        call.
      </p>
      {catalog.using ? (
        <p className="text-xs leading-5 text-[var(--haven-brass)]">
          Now: {catalog.using.chat} for typed chat, {catalog.using.call} for Call.
        </p>
      ) : null}
      <ModelPick
        mark="type"
        label="Text to text"
        value={catalog.chat ?? ""}
        onChange={(value) => void save({ chatModel: value || null })}
        empty="Let Haven pick"
        options={catalog.ollama.map((model) => ({
          id: model.name,
          label: model.tight ? `${model.label} · tight RAM` : model.label,
        }))}
      />
      <ModelPick
        mark="call"
        label="Voice to voice"
        value={catalog.call ?? ""}
        onChange={(value) => void save({ callModel: value || null })}
        empty="Let Haven pick"
        options={catalog.ollama.map((model) => ({
          id: model.name,
          label: model.tight ? `${model.label} · tight RAM` : model.label,
        }))}
      />
      <ModelPick
        mark="hear"
        label="Voice to text"
        value={catalog.whisper}
        onChange={(value) => void save({ whisperModel: value })}
        options={catalog.whisperOffers.map((offer) => ({
          id: offer.id,
          label: `${offer.label}${offer.cached ? " · on this computer" : ` · ${offer.note}`}`,
        }))}
      />
      {catalog.ollama.length === 0 ? (
        <p className="text-xs leading-5 text-[var(--haven-mute)]">
          No chat models in Ollama yet. Open Ollama, pull one, then refresh.
        </p>
      ) : null}
      <button type="button" className={boxBtn} onClick={() => void reload()}>
        Refresh list
      </button>
      {note ? <p className="text-xs text-[var(--haven-brass)]">{note}</p> : null}
    </div>
  );
}

function ModelPick({
  mark,
  label,
  value,
  empty,
  options,
  onChange,
}: {
  mark: "type" | "hear" | "call";
  label: string;
  value: string;
  empty?: string;
  options: Array<{ id: string; label: string }>;
  onChange: (next: string) => void;
}) {
  return (
    <label className="block space-y-2 text-[var(--haven-mute)]">
      <span className="flex items-center gap-2">
        <i className={`haven-shift-${mark}`} aria-hidden />
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 h-11 w-full rounded-md border border-[var(--haven-edge)] bg-[var(--haven-panel)] px-3 text-[var(--haven-ink)] outline-none"
      >
        {empty ? <option value="">{empty}</option> : null}
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
