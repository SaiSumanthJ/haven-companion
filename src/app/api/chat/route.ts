import { buildFitInstructions } from "@/features/companion/fitInstructions";
import { ATTACH_NOTE, buildSystemPrompt, TYPED_CHAT_NOTE, VOICE_CALL_NOTE } from "@/features/companion/persona";
import { ATTACH_MARK } from "@/features/memory/attachContext";
import { parseFit } from "@/features/companion/userFit";
import { reviewUserText } from "@/features/safety/policy";
import { resolveModel, type ChatMessage, type TalkPace } from "@/ports/model";
import { NextResponse } from "next/server";

type Body = {
  companionName?: string;
  adultMode?: boolean;
  knownFacts?: string[];
  salientFacts?: string[];
  roomSummary?: string;
  userFit?: unknown;
  messages?: ChatMessage[];
  stream?: boolean;
  pace?: TalkPace;
  warm?: boolean;
};

function safetyResponse(lastUser: string) {
  const safety = reviewUserText(lastUser);
  if (safety.kind === "refuse") {
    return { kind: "refuse" as const, text: safety.reason };
  }
  if (safety.kind === "crisis") {
    return {
      kind: "crisis" as const,
      text: `I'm not going to walk through that as a scene. You matter more than this chat.\n\n${safety.resource}`,
    };
  }
  return null;
}

export async function POST(request: Request) {
  const body = (await request.json()) as Body;
  const pace: TalkPace = body.pace === "call" ? "call" : "chat";
  if (body.warm) {
    const model = await resolveModel(pace);
    return NextResponse.json({ kind: "warm", adapter: model.id, label: model.label });
  }
  const messages = (body.messages ?? []).filter(
    (message) => message.role === "user" || message.role === "assistant",
  );
  const lastUser = [...messages].reverse().find((message) => message.role === "user");

  if (!lastUser?.content.trim()) {
    return NextResponse.json({ error: "Say something first." }, { status: 400 });
  }

  const blocked = safetyResponse(lastUser.content);
  if (blocked) {
    return NextResponse.json(blocked);
  }

  const model = await resolveModel(pace);
  const facts = body.knownFacts ?? [];
  const system = [
    buildSystemPrompt({
      companionName: body.companionName?.trim() || "Ash",
      adultMode: Boolean(body.adultMode),
      knownFacts: facts,
      salientFacts: body.salientFacts,
      roomSummary: body.roomSummary,
    }),
    buildFitInstructions(parseFit(body.userFit), pace === "call"),
    pace === "call" ? VOICE_CALL_NOTE : TYPED_CHAT_NOTE,
    messages.some((message) => message.content.includes(ATTACH_MARK)) ? ATTACH_NOTE : "",
  ]
    .filter(Boolean)
    .join("\n");
  const payload = {
    system,
    pace,
    messages: messages.slice(pace === "call" ? -6 : -16),
  };

  try {
    if (!body.stream) {
      const text = await model.complete(payload);
      return NextResponse.json({ kind: "ok", text, adapter: model.id });
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const text = await model.complete({
            ...payload,
            onDelta(chunk) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ kind: "delta", text: chunk })}\n\n`),
              );
            },
          });
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ kind: "done", text, adapter: model.id })}\n\n`,
            ),
          );
        } catch (error) {
          const detail = error instanceof Error ? error.message : "Unknown model error";
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ kind: "error", text: `The model port failed: ${detail}` })}\n\n`,
            ),
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Unknown model error";
    return NextResponse.json(
      { kind: "error", text: `The model port failed: ${detail}` },
      { status: 502 },
    );
  }
}
