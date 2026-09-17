import { CallPanel } from "@/features/chat/CallPanel";
import { ChatThread } from "@/features/chat/ChatThread";
import { Composer } from "@/features/chat/Composer";
import { RoomGuide } from "@/features/chat/RoomGuide";
import { RoomSidebar } from "@/features/chat/RoomSidebar";
import type { useHavenSession } from "@/features/chat/useHavenSession";
import { useVoiceCall } from "@/features/voice/useVoiceCall";
import { activeTurns } from "@/features/memory/chats";

type HavenRoomProps = {
  session: ReturnType<typeof useHavenSession>;
};

export function HavenRoom({ session }: HavenRoomProps) {
  const { state, health } = session;
  const turns = activeTurns(state);
  const call = useVoiceCall(session.speakTurn);
  const waking = health?.adapter === "ollama" && !session.liveReply && turns.length === 0;
  const careNote =
    turns.length >= 20
      ? "A walk, a friend, or a pause still counts."
      : turns.length >= 8
        ? "Still software. Not a person, and not therapy."
        : null;

  return (
    <main className="mx-auto flex h-[100dvh] w-full max-w-3xl flex-col gap-3 overflow-hidden px-4 pt-5 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6 sm:pt-6">
      <header className="flex shrink-0 items-center gap-4">
        <RoomSidebar session={session} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <p className="haven-mark">Haven</p>
            <RoomGuide
              companionName={state.companionName}
              factCount={state.knownFacts.length}
              healthDetail={
                health?.adapter === "mock" || (health && !health.ready)
                  ? health.detail
                  : undefined
              }
            />
          </div>
          {health?.adapter === "mock" ? (
            <p className="mt-2 text-xs leading-5 text-[var(--haven-mute)]">
              Demo replies only. In a terminal in this folder run npm run setup, install the
              model it names, keep Ollama open, then refresh.
            </p>
          ) : null}
        </div>
      </header>
      <ChatThread
        turns={turns}
        pending={session.pending}
        liveReply={session.liveReply}
        crisisText={session.crisisText}
        recentSuggestions={session.recentSuggestions}
        pastSuggestions={session.pastSuggestions}
        onAddSuggestion={session.addSuggestion}
        onRestartPrompt={session.restartFrom}
        pendingLabel={waking ? "Waking the local model…" : "Answering…"}
        careNote={careNote}
      />
      <div className="shrink-0">
        {call.active ? (
          <CallPanel
            companionName={state.companionName}
            phase={call.phase}
            error={call.error}
            prefs={call.prefs}
            voices={call.voices}
            onPrefs={call.setPrefs}
            onTalk={call.toggleTalk}
            onPreview={call.preview}
            offerTalk={call.offerTalk}
          />
        ) : null}
        <Composer
          value={session.draft}
          pending={session.pending}
          callActive={call.active}
          callSupported={call.supported}
          callReady={call.ready}
          onChange={session.setDraft}
          onSend={(attach) => {
            if (call.active) {
              const line = session.draft;
              call.hold();
              void call.replyTo(line);
              return;
            }
            session.send(attach);
          }}
          onCall={() => {
            if (call.active) call.end();
            else call.start();
          }}
        />
        {!call.active && call.error ? (
          <p className="mt-2 text-xs leading-5 text-[var(--haven-crisis-edge)]">{call.error}</p>
        ) : null}
      </div>
    </main>
  );
}
