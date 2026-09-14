import { isServerDocument, kindFromName, MAX_ATTACH_BYTES, readDocumentBytes } from "@/ports/files";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: Request) {
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Attach a file first." }, { status: 400 });
  }
  if (file.size > MAX_ATTACH_BYTES) {
    return NextResponse.json({ error: "That file is too large for this room (20MB)." }, { status: 400 });
  }
  const name = file.name || "file";
  const kind = kindFromName(name, file.type);
  if (!isServerDocument(name) && kind !== "document") {
    return NextResponse.json({ error: "This door only reads documents." }, { status: 400 });
  }
  try {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const reading = await readDocumentBytes(name, bytes);
    if (!reading) {
      return NextResponse.json({
        name,
        kind: "document",
        reading: "The file opened, but no readable text was found.",
      });
    }
    return NextResponse.json({ name, kind: "document", reading });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "The file could not be read.";
    return NextResponse.json({ error: detail }, { status: 500 });
  }
}
