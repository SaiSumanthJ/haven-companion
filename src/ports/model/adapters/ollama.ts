import { callReplyComplete } from "../callReply";
import type { CompanionModel, CompleteRequest } from "../types";

export const OLLAMA_HOST = process.env.OLLAMA_HOST ?? "http://127.0.0.1:11434";
const host = OLLAMA_HOST;
const CHAT_CTX = 8192;
const CHAT_PREDICT = 512;
const CALL_CTX = 2048;
const CALL_PREDICT = 400;

function visibleText(text: string): string {
  return text.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
}

export function createOllamaModel(name: string): CompanionModel {
  return {
    id: "ollama",
    label: `Ollama · ${name}`,
    async complete(request: CompleteRequest): Promise<string> {
      const streaming = Boolean(request.onDelta);
      const response = await fetch(`${host}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: name,
          stream: streaming,
          think: false,
          keep_alive: "30m",
          options: {
            num_ctx: request.pace === "call" ? CALL_CTX : CHAT_CTX,
            num_predict: request.pace === "call" ? CALL_PREDICT : CHAT_PREDICT,
          },
          messages: [
            { role: "system", content: request.system },
            ...request.messages.map((message) => ({
              role: message.role,
              content: message.content,
              ...(message.images?.length ? { images: message.images } : {}),
            })),
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama ${response.status}: ${await response.text()}`);
      }

      if (!streaming) {
        const payload = (await response.json()) as {
          message?: { content?: string };
        };
        const text = visibleText(payload.message?.content ?? "");
        if (!text) {
          throw new Error("Ollama returned an empty message");
        }
        return text;
      }

      if (!response.body) {
        throw new Error("Ollama returned an empty stream");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let full = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.trim()) continue;
          const payload = JSON.parse(line) as { message?: { content?: string } };
          const chunk = payload.message?.content ?? "";
          if (chunk) {
            full += chunk;
            request.onDelta?.(chunk);
            if (request.pace === "call" && callReplyComplete(full)) {
              await reader.cancel().catch(() => undefined);
              return visibleText(full);
            }
          }
        }
      }
      const text = visibleText(full);
      if (!text) {
        throw new Error("Ollama returned an empty message");
      }
      return text;
    },
  };
}

export {
  isOllamaReady,
  resolveOllamaCallModel,
  resolveOllamaModel,
  startOllamaWarm,
} from "./ollamaReady";
