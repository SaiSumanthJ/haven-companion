import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { UserFit } from "./userFit";

export const FIT_ROOT = "fit";

const CATEGORIES: Array<{ field: Exclude<keyof UserFit, "callMe">; folder: string }> = [
  { field: "personality", folder: "personality" },
  { field: "ageBand", folder: "age-band" },
  { field: "gender", folder: "gender" },
  { field: "pronouns", folder: "pronouns" },
  { field: "place", folder: "place" },
  { field: "household", folder: "household" },
  { field: "hour", folder: "hour" },
  { field: "pace", folder: "pace" },
  { field: "role", folder: "role" },
  { field: "talk", folder: "talk" },
  { field: "questions", folder: "questions" },
  { field: "care", folder: "care" },
];

const cache = new Map<string, string>();

export function fitFilePath(folder: string, option: string): string {
  return join(process.cwd(), FIT_ROOT, folder, `${option}.md`);
}

export function readFitOption(folder: string, option: string): string {
  if (!option || option === "skip") return "";
  const key = `${folder}/${option}`;
  const cached = cache.get(key);
  if (cached !== undefined) return cached;
  try {
    const text = readFileSync(fitFilePath(folder, option), "utf8").trim();
    cache.set(key, text);
    return text;
  } catch {
    cache.set(key, "");
    return "";
  }
}

export function buildFitInstructions(fit?: UserFit, brief = false): string {
  if (!fit) return "";
  const parts: string[] = [];
  const name = fit.callMe.trim();
  const personality = readFitOption("personality", fit.personality);
  if (personality) {
    parts.push(
      `PERSONALITY FIRST. This file outranks the other how-they-asked notes when they conflict. A saved fact still wins. Safety still wins.\n\n${personality}`,
    );
  }
  if (name) {
    parts.push(
      `They asked to be called ${name}. Use that name naturally. Do not invent a different nickname.`,
    );
  }
  if (brief) {
    if (parts.length === 0) return "";
    return [
      "How they asked you to be with them (same model, different instructions):",
      ...parts,
      "Use these notes. If a saved fact disagrees, the fact wins.",
    ].join("\n\n");
  }

  for (const category of CATEGORIES) {
    if (category.field === "personality") continue;
    const option = fit[category.field];
    if (typeof option !== "string" || option === "skip") continue;
    const text = readFitOption(category.folder, option);
    if (text) parts.push(text);
  }
  if (parts.length === 0) return "";
  return [
    "How they asked you to be with them (same model, different instructions):",
    ...parts,
    "Use these notes. Do not flatten them into a demographic. If a saved fact disagrees, the fact wins.",
  ].join("\n\n");
}
