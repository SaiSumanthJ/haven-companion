import { fitsComfortably } from "../src/ports/model/adapters/ollamaSelect.ts";
import type { ModelOffer } from "./modelOffers.ts";

const SKIP_FAMILY =
  /embed|embedding|guard|shield|ocr|vision|[-.]vl\b|llava|moondream|coder|code(?!s)|translate|function|medllama|medgemma|whisper|minilm|bge-|paraphrase|sqlcoder|mathstral|chatqa|gradient|tool-use|llama-pro/i;
const FAMILY_PREFIX =
  /^(gemma|llama|qwen|phi|mistral|olmo|tinyllama|smollm)(?:\d|$|[.-])/i;
const SKIP_TAG = /cloud|mlx|bf16|fp16|f16|nvfp4|mxfp8/i;
const SIMPLE_TAG = /^[a-z0-9._-]+:((?:[0-9.]+b)|e[0-9]b|latest)$/i;

export function parseLibraryFamilies(html: string): string[] {
  const names = new Set<string>();
  const found = html.matchAll(/href="\/library\/([a-zA-Z0-9._-]+)"/g);
  for (const match of found) names.add(match[1]);
  return [...names];
}

export function isCompanionFamily(name: string): boolean {
  return !SKIP_FAMILY.test(name) && FAMILY_PREFIX.test(name);
}

export function parseFamilyOffers(html: string): ModelOffer[] {
  const offers: ModelOffer[] = [];
  const seen = new Set<string>();
  const found = html.matchAll(
    /\/library\/([a-zA-Z0-9._-]+:[a-zA-Z0-9._-]+)"[\s\S]{0,500}?([0-9.]+)\s*(GB|MB)/gi,
  );
  for (const match of found) {
    const pull = match[1];
    if (seen.has(pull) || SKIP_TAG.test(pull)) continue;
    if (!SIMPLE_TAG.test(pull)) continue;
    seen.add(pull);
    const amount = Number(match[2]);
    if (!Number.isFinite(amount) || amount <= 0) continue;
    const sizeBytes = match[3].toUpperCase() === "MB" ? amount * 1024 * 1024 : amount * 1024 * 1024 * 1024;
    offers.push({
      pull,
      label: prettyLabel(pull),
      sizeBytes,
      note: `${prettyLabel(pull)} from Ollama’s current library (~${formatGb(sizeBytes)} on disk).`,
    });
  }
  return offers;
}

export function recommendFromOffers(
  offers: ModelOffer[],
  totalMemoryBytes: number,
): { recommended: ModelOffer | null; alternatives: ModelOffer[] } {
  const fitting = offers
    .filter((offer) => fitsComfortably(offer.sizeBytes, totalMemoryBytes))
    .sort((a, b) => scoreOffer(b) - scoreOffer(a));
  const recommended = fitting[0] ?? null;
  const alternatives = fitting.filter((offer) => offer.pull !== recommended?.pull).slice(0, 2);
  return { recommended, alternatives };
}

export function scoreOffer(offer: ModelOffer): number {
  const tag = offer.pull.split(":")[1] ?? "";
  const effective = /e([0-9]+)b/i.exec(tag);
  const sized = /([0-9.]+)b/i.exec(tag);
  const billions = effective
    ? Number(effective[1])
    : sized
      ? Number(sized[1])
      : offer.sizeBytes / (3.2 * 1024 * 1024 * 1024);
  const instruct = /(it|instruct|chat)/i.test(offer.pull) ? 1.12 : 1;
  const family = offer.pull.split(":")[0] ?? "";
  const generation = /(?:gemma|llama|qwen|phi|mistral|olmo)[^\d]*([0-9]+(?:\.[0-9]+)?)/i.exec(
    family,
  );
  const gen = generation ? Number(generation[1]) : 1;
  const huge = billions > 35 ? 0.35 : 1;
  return (gen * 25 + billions * huge) * instruct * (offer.sizeBytes > 0 ? 1 : 0);
}

function prettyLabel(pull: string): string {
  const [family, tag] = pull.split(":");
  const name = family.replace(/([a-z])([0-9])/g, "$1 $2");
  return `${name} ${tag ?? ""}`.replace(/\b\w/g, (c) => c.toUpperCase()).trim();
}

function formatGb(bytes: number): string {
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}
