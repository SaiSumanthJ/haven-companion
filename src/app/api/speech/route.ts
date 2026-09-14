import {
  ensureWhisper,
  transcribeSamples,
  whisperProgress,
} from "@/ports/speech";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MIN_BYTES = 16_000;
const MAX_BYTES = 16_000 * 4 * 60;

export async function GET() {
  void ensureWhisper().catch(() => undefined);
  return NextResponse.json(whisperProgress());
}

export async function POST(request: Request) {
  const bytes = new Uint8Array(await request.arrayBuffer());
  if (bytes.byteLength < MIN_BYTES) {
    return NextResponse.json(
      { error: "That take was too short. Hold Voice for a second, then speak." },
      { status: 400 },
    );
  }
  if (bytes.byteLength > MAX_BYTES || bytes.byteLength % 4 !== 0) {
    return NextResponse.json(
      { error: "That recording could not be read. Try a shorter take." },
      { status: 400 },
    );
  }

  const samples = new Float32Array(
    bytes.buffer,
    bytes.byteOffset,
    bytes.byteLength / 4,
  );

  try {
    const text = await transcribeSamples(samples);
    return NextResponse.json({ text });
  } catch (error) {
    const detail =
      error instanceof Error ? error.message : "The voice model could not read that.";
    return NextResponse.json({ error: detail }, { status: 500 });
  }
}
