import type { CompanionModel, CompleteRequest } from "../types";

function lastUserText(request: CompleteRequest): string {
  for (let i = request.messages.length - 1; i >= 0; i -= 1) {
    if (request.messages[i]?.role === "user") {
      return request.messages[i].content.trim();
    }
  }
  return "";
}

function replyFor(request: CompleteRequest): string {
  const user = lastUserText(request);
  const named = /(?:my name is|i(?:'m| am))\s+([A-Za-z][a-zA-Z]+)/i.exec(
    user,
  )?.[1];

    if (!user) {
    return "I'm here. Say whatever is on your mind — I'll stay with it.";
  }

  if (/room just opened|just opened the room/i.test(user)) {
    return "Hey. I'm here. Tell me what kind of night this is.";
  }

  if (named) {
    return `I'll remember the name ${named}. I'm running in demo mode until a real model is connected, but I can still hold a thread with you. What do you want this space to be?`;
  }

  if (user.length < 40) {
    return `I heard you. "${user}" — stay with that a moment. I'm in demo mode, so I'm reflecting rather than fully improvising. Tell me more about how that sits with you.`;
  }

  return `I'm with you on that. In demo mode I keep your words and the facts you save, then a real model (Ollama or OpenRouter) will speak with the same memory. What matters most in what you just said?`;
}

export const mockModel: CompanionModel = {
  id: "mock",
  label: "Demo companion (no model installed)",
  async complete(request: CompleteRequest): Promise<string> {
    const text = replyFor(request);
    if (request.onDelta) {
      for (const word of text.split(/(\s+)/)) {
        if (word) request.onDelta(word);
      }
    }
    return text;
  },
};
