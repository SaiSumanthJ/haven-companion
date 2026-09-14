import mammoth from "mammoth";
import { extractText } from "unpdf";

function cleanText(text: string): string {
  return text.replace(/\u0000/g, "").replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

function fromPlain(bytes: Uint8Array, name: string): string {
  const raw = new TextDecoder("utf-8", { fatal: false }).decode(bytes);
  if (/\.html?$/i.test(name)) {
    return cleanText(raw.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " "));
  }
  return cleanText(raw);
}

export async function readDocumentBytes(name: string, bytes: Uint8Array): Promise<string> {
  if (/\.pdf$/i.test(name)) {
    const result = await extractText(bytes, { mergePages: true });
    return cleanText(result.text);
  }
  if (/\.docx$/i.test(name)) {
    const result = await mammoth.extractRawText({ buffer: Buffer.from(bytes) });
    return cleanText(result.value);
  }
  return fromPlain(bytes, name);
}
