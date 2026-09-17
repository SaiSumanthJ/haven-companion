import { parseRememberPayload } from "@/features/memory/extractParse";
import { buildRememberPrompt } from "@/features/memory/rememberPrompt";
import { ROOM_SUMMARY_TURNS } from "@/features/memory/types";
import { resolveModel } from "@/ports/model";
import { NextResponse } from "next/server";

type Body = {
  knownFacts?: string[];
  recentLines?: string[];
  roomLines?: string[];
  olderLines?: string[];
  existingSummary?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as Body;
  const recentLines = (body.recentLines ?? []).filter((line) => typeof line === "string");
  if (recentLines.length === 0) {
    return NextResponse.json({ facts: [], summary: "" });
  }

  const model = await resolveModel();
  if (model.id === "mock") {
    return NextResponse.json({ facts: [], summary: body.existingSummary ?? "" });
  }

  try {
    const raw = await model.complete({
      system: buildRememberPrompt({
        knownFacts: body.knownFacts ?? [],
        recentLines,
        roomLines: [
          ...(body.roomLines ?? []),
          ...(body.olderLines ?? []),
        ]
          .filter((line) => typeof line === "string")
          .slice(-ROOM_SUMMARY_TURNS),
        existingSummary: body.existingSummary ?? "",
      }),
      messages: [{ role: "user", content: "Return the JSON now." }],
    });
    return NextResponse.json(parseRememberPayload(raw));
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Remember failed.";
    return NextResponse.json({ error: detail, facts: [], summary: "" }, { status: 502 });
  }
}
