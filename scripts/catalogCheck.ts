import {
  isCompanionFamily,
  parseFamilyOffers,
  parseLibraryFamilies,
  recommendFromOffers,
  scoreOffer,
} from "./libraryParse.ts";

const failures: string[] = [];
const index = `
  <a href="/library/gemma4">gemma4</a>
  <a href="/library/embeddinggemma">embeddinggemma</a>
  <a href="/library/llama3.2">llama3.2</a>
`;
const families = parseLibraryFamilies(index);
if (!families.includes("gemma4") || !families.includes("llama3.2")) {
  failures.push("library index must list official family pages");
}
if (isCompanionFamily("embeddinggemma") || isCompanionFamily("llama3.2-vision")) {
  failures.push("embedding and vision families must not be companion picks");
}
if (!isCompanionFamily("gemma4") || !isCompanionFamily("qwen3.6") || !isCompanionFamily("llama5")) {
  failures.push("future gemma, llama, and qwen names must still count as companion families");
}

const page = `
  <a href="/library/gemma4:26b" class="x">gemma4:26b</a>
  <p class="flex text-neutral-500">18GB · 128K context window</p>
  <a href="/library/gemma4:12b" class="x">gemma4:12b</a>
  <p class="flex text-neutral-500">7.6GB · 128K context window</p>
  <a href="/library/gemma4:26b-cloud" class="x">gemma4:26b-cloud</a>
  <p class="flex text-neutral-500">18GB · cloud</p>
  <a href="/library/gemma4:26b-a4b-it-q8_0" class="x">gemma4:26b-a4b-it-q8_0</a>
  <p class="flex text-neutral-500">28GB · 128K</p>
`;
const offers = parseFamilyOffers(page);
const pulls = offers.map((item) => item.pull).sort();
if (pulls.join(",") !== "gemma4:12b,gemma4:26b") {
  failures.push(`simple public tags only, got ${pulls.join(",")}`);
}
const gb = (n: number) => n * 1024 * 1024 * 1024;
const on32 = recommendFromOffers(offers, gb(32));
if (on32.recommended?.pull !== "gemma4:26b") {
  failures.push(`32GB should take the live 18GB 26B tag, got ${on32.recommended?.pull}`);
}
const on16 = recommendFromOffers(offers, gb(16));
if (on16.recommended?.pull !== "gemma4:12b") {
  failures.push(`16GB should take 12B, got ${on16.recommended?.pull}`);
}
if (scoreOffer(offers[1]) >= scoreOffer(offers[0])) {
  failures.push("26B should outscore 12B");
}
const huge = {
  pull: "qwen:72b",
  label: "Qwen 72b",
  sizeBytes: gb(41),
  note: "",
};
if (scoreOffer(huge) >= scoreOffer(offers[0])) {
  failures.push("a current-gen 26B must beat an old 72B tag");
}

if (failures.length) {
  for (const failure of failures) console.error(failure);
  process.exit(1);
}
console.log("catalogCheck passed");
