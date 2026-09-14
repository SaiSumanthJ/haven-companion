import { fork, type ChildProcess } from "node:child_process";
import { join } from "node:path";

export type WorkerEvent = {
  type?: string;
  id?: string;
  wav?: string;
  error?: string;
  percent?: number;
  detail?: string;
};

export function spawnKokoroWorker(
  onEvent: (event: WorkerEvent) => void,
  onExit: () => void,
): ChildProcess {
  const child = fork(join(process.cwd(), "scripts/kokoro-worker.mjs"), [], {
    cwd: process.cwd(),
    execArgv: [],
    stdio: ["ignore", "inherit", "inherit", "ipc"],
    env: { ...process.env, NODE_OPTIONS: "" },
  });
  child.on("message", (raw) => onEvent(raw as WorkerEvent));
  child.on("exit", onExit);
  return child;
}
