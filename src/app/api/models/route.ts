import { readLocalPrefs, writeLocalPrefs } from "@/ports/localPrefs";
import { forgetResolvedModels, resolveModel } from "@/ports/model";
import { listInstalled } from "@/ports/model/adapters/ollamaReady";
import { fitsComfortably, isChatCapable, systemMemoryBytes } from "@/ports/model/adapters/ollamaSelect";
import { resetWhisper } from "@/ports/speech/whisper";
import { listWhisperOffers, selectedWhisperId, WHISPER_OFFERS } from "@/ports/speech/whisperOffers";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function listedChat() {
  const ram = systemMemoryBytes();
  return listInstalled().then((models) =>
    models
      .filter((model) => model.name && isChatCapable(model))
      .map((model) => ({
        name: model.name,
        label: `${model.name}${model.parameterSize ? ` · ${model.parameterSize}` : ""}`,
        tight: !fitsComfortably(model.size, ram),
      })),
  );
}

async function usingNow() {
  const [chat, call] = await Promise.all([resolveModel("chat"), resolveModel("call")]);
  return { chat: chat.label, call: call.label };
}

export async function GET() {
  const prefs = readLocalPrefs();
  let ollama: Awaited<ReturnType<typeof listedChat>> = [];
  try {
    ollama = await listedChat();
  } catch {
    ollama = [];
  }
  return NextResponse.json({
    chat: prefs.chatModel,
    call: prefs.callModel,
    whisper: selectedWhisperId(),
    ollama,
    whisperOffers: listWhisperOffers(),
    using: await usingNow(),
  });
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    chatModel?: string | null;
    callModel?: string | null;
    whisperModel?: string | null;
  };
  let installed: Awaited<ReturnType<typeof listedChat>> = [];
  try {
    installed = await listedChat();
  } catch {
    installed = [];
  }
  const names = new Set(installed.map((model) => model.name));
  const whisperIds = new Set(WHISPER_OFFERS.map((offer) => offer.id));

  if (body.chatModel && !names.has(body.chatModel)) {
    return NextResponse.json({ ok: false, error: "That chat model is not installed." }, { status: 400 });
  }
  if (body.callModel && !names.has(body.callModel)) {
    return NextResponse.json({ ok: false, error: "That Call model is not installed." }, { status: 400 });
  }
  if (body.whisperModel && !whisperIds.has(body.whisperModel)) {
    return NextResponse.json({ ok: false, error: "That hearing model is not on the list." }, { status: 400 });
  }

  const whisperBefore = selectedWhisperId();
  const next = writeLocalPrefs({
    chatModel: body.chatModel === undefined ? undefined : body.chatModel?.trim() || null,
    callModel: body.callModel === undefined ? undefined : body.callModel?.trim() || null,
    whisperModel:
      body.whisperModel === undefined ? undefined : body.whisperModel?.trim() || null,
  });
  forgetResolvedModels();
  if (selectedWhisperId() !== whisperBefore) resetWhisper();
  return NextResponse.json({ ok: true, ...next, using: await usingNow() });
}
