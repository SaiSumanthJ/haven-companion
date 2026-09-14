import type { UserFit } from "@/features/companion/userFit";
import type { TalkPace } from "@/ports/model";

export type CompanionReply = {
  kind: "ok" | "crisis" | "refuse" | "error";
  text: string;
};

export async function requestReply(
  input: {
    companionName: string;
    adultMode: boolean;
    knownFacts: string[];
    roomSummary?: string;
    userFit?: UserFit;
    messages: Array<{ role: "user" | "assistant"; content: string; images?: string[] }>;
    pace?: TalkPace;
  },
  onDelta?: (chunk: string) => void,
): Promise<CompanionReply> {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...input, stream: Boolean(onDelta) }),
  });

  const type = response.headers.get("content-type") ?? "";
  if (!type.includes("text/event-stream")) {
    const payload = (await response.json()) as CompanionReply & { error?: string };
    if (payload.error && !payload.text) {
      return { kind: "error", text: payload.error };
    }
    return {
      kind: payload.kind ?? "ok",
      text: payload.text ?? "I could not answer just then.",
    };
  }

  if (!response.body) {
    return { kind: "error", text: "The room lost the line. Your words are still saved." };
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let full = "";
  let kind: CompanionReply["kind"] = "ok";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split("\n\n");
    buffer = parts.pop() ?? "";
    for (const part of parts) {
      const line = part.split("\n").find((row) => row.startsWith("data:"));
      if (!line) continue;
      const payload = JSON.parse(line.slice(5).trim()) as {
        kind?: string;
        text?: string;
      };
      if (payload.kind === "delta" && payload.text) {
        full += payload.text;
        onDelta?.(payload.text);
      }
      if (payload.kind === "done" && payload.text) {
        full = payload.text;
        kind = "ok";
      }
      if (payload.kind === "error" && payload.text) {
        kind = "error";
        full = payload.text;
      }
    }
  }

  return { kind, text: full || "I could not answer just then." };
}
