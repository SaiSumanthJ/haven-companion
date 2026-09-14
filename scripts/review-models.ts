import { totalmem } from "node:os";
import { loadCatalog, recommendCatalog } from "./libraryCatalog.ts";
import { comfortHeadroomBytes } from "../src/ports/model/adapters/ollamaSelect.ts";

const GB = 1024 * 1024 * 1024;

function gb(bytes: number): string {
  return `${(bytes / GB).toFixed(1)} GB`;
}

const ram = totalmem();
const catalog = await loadCatalog();
const { recommended, alternatives } = recommendCatalog(catalog, ram);

console.log("Haven model review");
console.log("This reads Ollama’s current public library on your computer. Nothing is uploaded.");
console.log();
console.log(`Memory on your computer: ${gb(ram)}`);
console.log(`RAM reserve kept free: ${gb(comfortHeadroomBytes(ram))}`);
console.log(
  catalog.source === "live"
    ? `Library check: live from ollama.com (${catalog.offers.length} companion tags)`
    : catalog.source === "cache"
      ? `Library check: saved from ${catalog.checkedAt} (${catalog.offers.length} tags). Run again tomorrow for a fresh pull.`
      : "Library check: offline. Using the built-in list that shipped with this copy.",
);
console.log();

if (!recommended) {
  console.log("No public chat model in this check fits your computer’s RAM.");
  console.log("Haven can still open in demo mode. A real companion needs about 8 GB of RAM.");
  process.exit(1);
}

console.log(`Use this first: ${recommended.label}  (~${gb(recommended.sizeBytes)})`);
console.log(`  ollama pull ${recommended.pull}`);
console.log(`  ${recommended.note}`);
if (alternatives.length) {
  console.log();
  console.log("Also fine on your computer:");
  for (const offer of alternatives) {
    console.log(`  ${offer.label} (~${gb(offer.sizeBytes)}): ollama pull ${offer.pull}`);
  }
}
console.log();
console.log("You can run npm run review-models any time — next year included.");
console.log("Haven then uses the strongest installed model that still fits.");
