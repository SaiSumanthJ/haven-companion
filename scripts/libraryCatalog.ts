import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { MODEL_OFFERS, type ModelOffer } from "./modelOffers.ts";
import {
  isCompanionFamily,
  parseFamilyOffers,
  parseLibraryFamilies,
  recommendFromOffers,
} from "./libraryParse.ts";

const LIBRARY = "https://ollama.com/library";
const CACHE_MS = 24 * 60 * 60 * 1000;
const PAGE_MS = 12000;

export type CatalogResult = {
  offers: ModelOffer[];
  source: "live" | "cache" | "fallback";
  checkedAt: string;
};

type CacheFile = { checkedAt: string; offers: ModelOffer[] };

export async function loadCatalog(root = process.cwd()): Promise<CatalogResult> {
  const cached = readCache(root);
  if (cached && Date.now() - Date.parse(cached.checkedAt) < CACHE_MS && cached.offers.length) {
    return { ...cached, source: "cache" };
  }
  try {
    const live = await fetchLiveOffers();
    if (live.length) {
      const result = { offers: live, source: "live" as const, checkedAt: new Date().toISOString() };
      writeCache(root, result);
      return result;
    }
  } catch {
    /* Offline or the library page changed. Use cache, then the built-in list. */
  }
  if (cached?.offers.length) return { ...cached, source: "cache" };
  return { offers: MODEL_OFFERS, source: "fallback", checkedAt: new Date().toISOString() };
}

export function recommendCatalog(
  catalog: CatalogResult,
  totalMemoryBytes: number,
): ReturnType<typeof recommendFromOffers> {
  return recommendFromOffers(catalog.offers, totalMemoryBytes);
}

async function fetchLiveOffers(): Promise<ModelOffer[]> {
  const index = await fetchText(LIBRARY);
  const families = parseLibraryFamilies(index).filter(isCompanionFamily);
  const pages = await mapPool(families, 6, (name) =>
    fetchText(`${LIBRARY}/${name}`).catch(() => ""),
  );
  const byPull = new Map<string, ModelOffer>();
  for (const html of pages) {
    for (const offer of parseFamilyOffers(html)) byPull.set(offer.pull, offer);
  }
  return [...byPull.values()];
}

async function fetchText(url: string): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PAGE_MS);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { "user-agent": "Haven-setup/1.0 (local companion; +https://github.com/SaiSumanthJ/haven-companion)" },
    });
    if (!response.ok) throw new Error(String(response.status));
    return await response.text();
  } finally {
    clearTimeout(timer);
  }
}

async function mapPool<T, R>(items: T[], width: number, work: (item: T) => Promise<R>): Promise<R[]> {
  const out: R[] = [];
  for (let i = 0; i < items.length; i += width) {
    out.push(...(await Promise.all(items.slice(i, i + width).map(work))));
  }
  return out;
}

function cachePath(root: string): string {
  return join(root, ".haven", "library-cache.json");
}

function readCache(root: string): CacheFile | null {
  try {
    const raw = JSON.parse(readFileSync(cachePath(root), "utf8")) as CacheFile;
    if (!Array.isArray(raw.offers) || !raw.checkedAt) return null;
    return raw;
  } catch {
    return null;
  }
}

function writeCache(root: string, result: CatalogResult): void {
  try {
    mkdirSync(join(root, ".haven"), { recursive: true });
    writeFileSync(
      cachePath(root),
      JSON.stringify({ checkedAt: result.checkedAt, offers: result.offers }, null, 2),
    );
  } catch {
    /* Cache is optional. */
  }
}
