export type FileKind = "image" | "document" | "video" | "audio" | "other";

const IMAGE = /\.(png|jpe?g|gif|webp|bmp)$/i;
const DOC = /\.(txt|md|csv|json|html?|pdf|docx|rtf)$/i;
const VIDEO = /\.(mp4|webm|mov|m4v|mkv)$/i;
const AUDIO = /\.(mp3|wav|m4a|ogg|aac|flac)$/i;

export const MAX_ATTACH_FILES = 3;
export const MAX_ATTACH_BYTES = 20 * 1024 * 1024;
export const MAX_VISION_IMAGES = 2;

export function kindFromName(name: string, type = ""): FileKind {
  if (type.startsWith("image/") || IMAGE.test(name)) return "image";
  if (type.startsWith("video/") || VIDEO.test(name)) return "video";
  if (type.startsWith("audio/") || AUDIO.test(name)) return "audio";
  if (type.startsWith("text/") || DOC.test(name)) return "document";
  return "other";
}

export function isServerDocument(name: string): boolean {
  return /\.(pdf|docx)$/i.test(name);
}
