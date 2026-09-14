export type ChatRole = "system" | "user" | "assistant";

export type ChatMessage = {
  role: ChatRole;
  content: string;
  images?: string[];
};

export type ModelAdapterId = "mock" | "ollama" | "openrouter";

export type TalkPace = "chat" | "call";

export type CompleteRequest = {
  messages: ChatMessage[];
  system: string;
  pace?: TalkPace;
  onDelta?: (chunk: string) => void;
};

export type CompanionModel = {
  id: ModelAdapterId;
  label: string;
  complete: (request: CompleteRequest) => Promise<string>;
};

export type ModelHealth = {
  adapter: ModelAdapterId;
  label: string;
  ready: boolean;
  detail: string;
};
