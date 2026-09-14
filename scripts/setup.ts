import { totalmem } from "node:os";
import { loadCatalog, recommendCatalog } from "./libraryCatalog.ts";
import {
  comfortHeadroomBytes,
  pickComfortableModel,
  type ListedOllamaModel,
} from "../src/ports/model/adapters/ollamaSelect.ts";

const GB = 1024 * 1024 * 1024;
const host = (process.env.OLLAMA_HOST ?? "http://127.0.0.1:11434").replace(/\/$/, "");

function gb(bytes: number): string {
  return `${(bytes / GB).toFixed(1)} GB`;
}

function line(text = ""): void {
  console.log(text);
}

const ram = totalmem();
const headroom = comfortHeadroomBytes(ram);
const catalog = await loadCatalog();
const { recommended, alternatives } = recommendCatalog(catalog, ram);
const nodeMajor = Number(process.versions.node.split(".")[0]);

line("Haven setup");
line("This check runs on your computer. Nothing is uploaded.");
line();
line(`1. Memory on your computer: ${gb(ram)}`);
line(`   Haven keeps about ${gb(headroom)} free for the system, the browser, Voice, and Call.`);
line(`   A local model may use up to ${gb(Math.max(0, ram - headroom))} on disk and in RAM.`);
line();

if (nodeMajor < 20) {
  line("2. Node.js is too old.");
  line(`   This computer has Node ${process.versions.node}. Haven needs Node 20 or newer.`);
  line("   Download the LTS installer: https://nodejs.org/");
  line("   Install it, close this terminal, open a new one, and run npm run setup again.");
  process.exit(1);
}
line(`2. Node.js ${process.versions.node} — new enough.`);
line();
line(
  catalog.source === "live"
    ? `   Model list: live from ollama.com (${catalog.offers.length} companion tags).`
    : catalog.source === "cache"
      ? `   Model list: last library check ${catalog.checkedAt}.`
      : "   Model list: built-in fallback (ollama.com could not be reached).",
);
line();

if (!recommended) {
  line("3. Your computer does not have enough RAM for a local chat model.");
  line("   Haven can still open in demo mode (your words save; replies are placeholders).");
  line("   A real companion needs about 8 GB of RAM or more.");
  process.exit(1);
}

line("3. Download one local model with Ollama (it stays on your computer).");
line(`   Recommended: ${recommended.label}  (~${gb(recommended.sizeBytes)})`);
line(`   ${recommended.note}`);
line();
line("   Copy this command, wait until it finishes, then come back:");
line();
line(`   ollama pull ${recommended.pull}`);
line();
if (alternatives.length) {
  line("   Other models that also fit your computer:");
  for (const offer of alternatives) {
    line(`   - ${offer.label} (~${gb(offer.sizeBytes)}): ollama pull ${offer.pull}`);
    line(`     ${offer.note}`);
  }
  line();
}
line("   You need that much free disk space as well as RAM.");
line("   Ollama: https://ollama.com/download");
line("   Later, run npm run review-models to check the library again.");
line();

const controller = new AbortController();
const timer = setTimeout(() => controller.abort(), 2500);
try {
  const response = await fetch(`${host}/api/tags`, { signal: controller.signal });
  clearTimeout(timer);
  if (!response.ok) throw new Error("Ollama is not ready");
  const payload = (await response.json()) as {
    models?: Array<{
      name?: string;
      size?: number;
      details?: { parameter_size?: string; quantization_level?: string };
      capabilities?: string[];
    }>;
  };
  const installed: ListedOllamaModel[] = (payload.models ?? []).map((entry) => ({
    name: entry.name ?? "",
    size: entry.size ?? 0,
    parameterSize: entry.details?.parameter_size ?? "",
    quantization: entry.details?.quantization_level ?? "",
    capabilities: entry.capabilities ?? [],
  }));
  line("4. Ollama is open.");
  const picked = pickComfortableModel(installed, ram);
  if (picked) {
    line(`   Haven will use: ${picked.name} (${gb(picked.size)})`);
    line();
    line("5. Start the site from this folder:");
    line("   npm install");
    line("   npm run dev");
    line("   Then open the Local address printed in that terminal.");
    line("   That is usually http://127.0.0.1:3000 on your computer.");
    line("   If 3000 is busy, the terminal prints 3001 or 3002 — use that.");
    line("   Keep this terminal and Ollama open while you use Haven.");
  } else {
    line("   Ollama is open, but no installed chat model fits your computer yet.");
    line(`   Run: ollama pull ${recommended.pull}`);
    line("   When that finishes, run npm run setup again.");
  }
} catch {
  clearTimeout(timer);
  line("4. Ollama is not running yet (or is not reachable).");
  line("   Install: https://ollama.com/download");
  line("   Open the Ollama app and leave it running.");
  line("   Then run the pull command above.");
  line("   Then run npm run setup again.");
  line();
  line("5. After the model is installed:");
  line("   npm install");
  line("   npm run dev");
  line("   Open the Local address the terminal prints (usually http://127.0.0.1:3000).");
}
