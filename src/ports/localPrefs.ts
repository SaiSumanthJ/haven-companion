import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export type LocalPrefs = {
  chatModel: string | null;
  callModel: string | null;
  whisperModel: string | null;
};

const EMPTY: LocalPrefs = {
  chatModel: null,
  callModel: null,
  whisperModel: null,
};

function prefsPath() {
  return join(process.cwd(), ".haven", "local-prefs.json");
}

export function readLocalPrefs(): LocalPrefs {
  try {
    const raw = JSON.parse(readFileSync(prefsPath(), "utf8")) as Partial<LocalPrefs>;
    return {
      chatModel: typeof raw.chatModel === "string" && raw.chatModel.trim() ? raw.chatModel.trim() : null,
      callModel: typeof raw.callModel === "string" && raw.callModel.trim() ? raw.callModel.trim() : null,
      whisperModel:
        typeof raw.whisperModel === "string" && raw.whisperModel.trim()
          ? raw.whisperModel.trim()
          : null,
    };
  } catch {
    return { ...EMPTY };
  }
}

export function writeLocalPrefs(patch: Partial<LocalPrefs>): LocalPrefs {
  const current = readLocalPrefs();
  const next: LocalPrefs = {
    chatModel: patch.chatModel !== undefined ? patch.chatModel : current.chatModel,
    callModel: patch.callModel !== undefined ? patch.callModel : current.callModel,
    whisperModel: patch.whisperModel !== undefined ? patch.whisperModel : current.whisperModel,
  };
  mkdirSync(join(process.cwd(), ".haven"), { recursive: true });
  writeFileSync(prefsPath(), JSON.stringify(next, null, 2));
  return next;
}
