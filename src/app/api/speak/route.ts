import { speakable } from "@/features/voice/callSpeech";
import { speakProgress, ensureKokoro, speakToWav } from "@/ports/speech";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VOICES = new Set([
  "af_heart",
  "af_bella",
  "af_nicole",
  "af_sarah",
  "am_michael",
  "am_fenrir",
  "bf_emma",
  "bm_george",
]);

export async function GET() {
  void ensureKokoro().catch(() => undefined);
  return NextResponse.json(speakProgress());
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    text?: string;
    voice?: string;
    rate?: "slow" | "natural" | "fast";
  };
  const text = typeof body.text === "string" ? speakable(body.text).slice(0, 3500) : "";
  if (!text) {
    return NextResponse.json({ error: "Nothing to speak." }, { status: 400 });
  }
  const voice = VOICES.has(body.voice ?? "") ? body.voice! : "af_heart";
  const rate = body.rate === "slow" || body.rate === "fast" ? body.rate : "natural";
  try {
    const wav = await speakToWav(text, voice, rate);
    return new NextResponse(Buffer.from(wav), {
      headers: {
        "Content-Type": "audio/wav",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    const detail =
      error instanceof Error ? error.message : "The spoken voice could not finish that line.";
    return NextResponse.json({ error: detail }, { status: 500 });
  }
}
