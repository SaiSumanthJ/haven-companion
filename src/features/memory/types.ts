import type { UserFit } from "@/features/companion/userFit";

export type AttachmentKind = "image" | "document" | "video" | "audio" | "other";

export type AttachmentNote = {
  name: string;
  kind: AttachmentKind;
  reading: string;
};

export type MemoryTurn = {
  id: string;
  role: "user" | "assistant";
  content: string;
  at: string;
  via?: "chat" | "call";
  attachments?: AttachmentNote[];
};

export type HavenChat = {
  id: string;
  title: string;
  turns: MemoryTurn[];
  summary: string;
  createdAt: string;
};

export type HavenState = {
  version: 2;
  ageVerified: boolean;
  adultMode: boolean;
  companionName: string;
  userFit: UserFit;
  knownFacts: string[];
  chats: HavenChat[];
  activeChatId: string;
  createdAt: string;
  lastOpenedAt?: string;
};

export const STORAGE_KEY = "haven.state.v1";
export const MAX_TURNS = 400;
export const MODEL_TURNS = 16;
export const ROOM_SUMMARY_TURNS = 48;
export const SUMMARY_MAX = 2000;
export const MAX_FACTS = 80;
export const MAX_CHATS = 12;
