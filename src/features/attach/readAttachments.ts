import { sharedLabel } from "@/features/memory/attachContext";
import type { AttachmentNote } from "@/features/memory/types";
import { framesFromVideo, jpegFromImage } from "@/features/attach/mediaLocal";
import type { AttachBundle } from "@/features/attach/types";
import { blobToWhisperSamples } from "@/features/voice/decodeAudio";
import { transcribeLocal } from "@/features/voice/speechStatus";
import {
  isServerDocument,
  kindFromName,
  MAX_ATTACH_BYTES,
  MAX_ATTACH_FILES,
  MAX_VISION_IMAGES,
} from "@/ports/files/kinds";

async function readServerDocument(file: File): Promise<string> {
  const body = new FormData();
  body.append("file", file);
  const response = await fetch("/api/attach", { method: "POST", body });
  const payload = (await response.json()) as { reading?: string; error?: string };
  if (!response.ok) throw new Error(payload.error || "That document could not be read.");
  return payload.reading ?? "";
}

async function spokenFromBlob(blob: Blob): Promise<string> {
  try {
    const samples = await blobToWhisperSamples(blob, 20);
    return await transcribeLocal(samples);
  } catch {
    return "";
  }
}

async function readOne(file: File): Promise<{ note: AttachmentNote; images: string[] }> {
  if (file.size > MAX_ATTACH_BYTES) {
    throw new Error(`${file.name} is larger than 20MB.`);
  }
  const kind = kindFromName(file.name, file.type);
  if (kind === "image") {
    const image = await jpegFromImage(file);
    return {
      note: {
        name: file.name,
        kind,
        reading: "A still picture they attached. Look at the image and use what you see.",
      },
      images: image ? [image] : [],
    };
  }
  if (kind === "video") {
    const frames = await framesFromVideo(file);
    const spoken = await spokenFromBlob(file);
    return {
      note: {
        name: file.name,
        kind,
        reading: [
          "A short clip. Still frames are attached.",
          spoken ? `Spoken words heard: ${spoken}` : "No clear speech was heard in the first seconds.",
        ].join(" "),
      },
      images: frames.slice(0, MAX_VISION_IMAGES),
    };
  }
  if (kind === "audio") {
    const spoken = await spokenFromBlob(file);
    return {
      note: {
        name: file.name,
        kind,
        reading: spoken
          ? `Spoken words from the recording: ${spoken}`
          : "An audio file was attached, but no clear speech was heard.",
      },
      images: [],
    };
  }
  if (kind === "document" || isServerDocument(file.name)) {
    const reading = isServerDocument(file.name)
      ? await readServerDocument(file)
      : (await file.text()).trim();
    return { note: { name: file.name, kind: "document", reading }, images: [] };
  }
  throw new Error(`${file.name} is not a format this room can open yet.`);
}

export async function readAttachments(files: File[]): Promise<AttachBundle> {
  const picked = files.slice(0, MAX_ATTACH_FILES);
  const notes: AttachmentNote[] = [];
  const images: string[] = [];
  for (const file of picked) {
    const item = await readOne(file);
    notes.push(item.note);
    for (const image of item.images) {
      if (images.length < MAX_VISION_IMAGES) images.push(image);
    }
  }
  return { notes, images, label: sharedLabel(notes) };
}
