import type { AttachmentNote } from "@/features/memory/types";

export type AttachBundle = {
  notes: AttachmentNote[];
  images: string[];
  label: string;
};
