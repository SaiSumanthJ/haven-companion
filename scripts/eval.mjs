import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const full = join(here, "self-eval.mjs");

if (!existsSync(full)) {
  console.log("Haven user copy: run npm run setup, then npm run dev.");
  process.exit(0);
}

const result = spawnSync(process.execPath, [full], { stdio: "inherit" });
process.exit(result.status ?? 1);
