import type { CompanionModel, CompleteRequest } from "../types";

const model =
  process.env.OPENROUTER_MODEL ?? "meta-llama/llama-3.3-70b-instruct:free";

export const openrouterModel: CompanionModel = {
  id: "openrouter",
  label: `OpenRouter · ${model}`,
  async complete(request: CompleteRequest): Promise<string> {
    const key = process.env.OPENROUTER_API_KEY;
    if (!key) {
      throw new Error("OPENROUTER_API_KEY is not set");
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        stream: Boolean(request.onDelta),
        messages: [
          { role: "system", content: request.system },
          ...request.messages.map((message) => {
            if (!message.images?.length) {
              return { role: message.role, content: message.content };
            }
            return {
              role: message.role,
              content: [
                { type: "text", text: message.content },
                ...message.images.map((image) => ({
                  type: "image_url" as const,
                  image_url: { url: `data:image/jpeg;base64,${image}` },
                })),
              ],
            };
          }),
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter ${response.status}: ${await response.text()}`);
    }

    if (!request.onDelta) {
      const payload = (await response.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const text = payload.choices?.[0]?.message?.content?.trim();
      if (!text) {
        throw new Error("OpenRouter returned an empty message");
      }
      return text;
    }

    if (!response.body) {
      throw new Error("OpenRouter returned an empty stream");
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
        if (!line.startsWith("data:")) continue;
        const data = line.slice(5).trim();
        if (!data || data === "[DONE]") continue;
        const payload = JSON.parse(data) as {
          choices?: Array<{ delta?: { content?: string } }>;
        };
        const chunk = payload.choices?.[0]?.delta?.content ?? "";
        if (chunk) {
          full += chunk;
          request.onDelta(chunk);
        }
      }
    }
    const text = full.trim();
    if (!text) {
      throw new Error("OpenRouter returned an empty message");
    }
    return text;
  },
};
