"use client";

import { CallSettings } from "@/features/chat/CallSettings";
import { ChatList } from "@/features/chat/ChatList";
import { CompanionName } from "@/features/chat/CompanionName";
import { LocalModels } from "@/features/chat/LocalModels";
import { SavedFacts } from "@/features/chat/SavedFacts";
import { SidebarSection } from "@/features/chat/SidebarSection";
import { quietBtn } from "@/features/chat/quietBtn";
import type { useHavenSession } from "@/features/chat/useHavenSession";
import { FitLeaveBar } from "@/features/companion/FitLeaveBar";
import { FitPane } from "@/features/companion/FitPane";
import { useFitLeave } from "@/features/companion/useFitLeave";
import { MemoryActions } from "@/features/memory/MemoryActions";
import { useCallPrefs } from "@/features/voice/useCallPrefs";
import { useState } from "react";

type RoomSidebarProps = {
  session: ReturnType<typeof useHavenSession>;
};

const KEYS = ["rooms", "name", "fit", "models", "voice", "facts", "device"] as const;

export function RoomSidebar({ session }: RoomSidebarProps) {
  const [open, setOpen] = useState(false);
  const [pane, setPane] = useState<(typeof KEYS)[number] | null>(null);
  const leave = useFitLeave(open, () => setOpen(false), () => setPane("fit"));
  const { state } = session;
  const callPrefs = useCallPrefs();

  function askLeave(next: () => void) {
    if (leave.dirty) setPane("fit");
    leave.ask(next);
  }

  function toggle(key: (typeof KEYS)[number]) {
    const next = pane === key ? null : key;
    if (pane === "fit" && next !== "fit") askLeave(() => setPane(next));
    else setPane(next);
  }

  function exportMemory() {
    const blob = new Blob([session.exportMemory()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "haven-memory.json";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <button
        type="button"
        aria-expanded={open}
        aria-controls="haven-sidebar"
        onClick={() => setOpen(true)}
        className="rounded-md border border-[var(--haven-edge)] px-3 py-2 text-sm text-[var(--haven-ink)]"
      >
        Menu
      </button>
      {open ? (
        <div className="fixed inset-0 z-40">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => askLeave(() => setOpen(false))}
            className="haven-veil absolute inset-0 bg-black/50"
          />
          <aside
            id="haven-sidebar"
            className="haven-scroll haven-menu-enter absolute inset-y-0 left-0 flex w-[min(22rem,calc(100vw-2rem))] flex-col overflow-y-auto border-r border-[var(--haven-edge)] bg-[var(--haven-night)] px-4 py-5 pt-[max(1.25rem,env(safe-area-inset-top))]"
          >
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs tracking-[0.18em] text-[var(--haven-brass)] uppercase">
                Rooms & memory
              </p>
              <button type="button" onClick={() => askLeave(() => setOpen(false))} className={quietBtn}>
                Close
              </button>
            </div>
            <SidebarSection title="Rooms" open={pane === "rooms"} onToggle={() => toggle("rooms")}>
              <ChatList
                chats={state.chats ?? []}
                activeChatId={state.activeChatId}
                onSelect={session.openChat}
                onNew={session.newChat}
              />
            </SidebarSection>
            <SidebarSection title="Name" open={pane === "name"} onToggle={() => toggle("name")}>
              <CompanionName name={state.companionName} onRename={session.renameCompanion} />
            </SidebarSection>
            {leave.warn ? (
              <FitLeaveBar onSave={() => leave.finish("save")} onDiscard={() => leave.finish("discard")} />
            ) : null}
            <SidebarSection
              title="How they know you"
              open={pane === "fit"}
              onToggle={() => toggle("fit")}
            >
              <FitPane
                fit={state.userFit}
                onSave={session.saveFit}
                onDirtyChange={leave.setDirty}
                onBind={leave.bind}
              />
            </SidebarSection>
            <SidebarSection
              title="Local models"
              open={pane === "models"}
              onToggle={() => toggle("models")}
            >
              <LocalModels onChanged={session.refreshHealth} />
            </SidebarSection>
            <SidebarSection title="Voice call" open={pane === "voice"} onToggle={() => toggle("voice")}>
              <CallSettings
                prefs={callPrefs.prefs}
                voices={callPrefs.voices}
                onChange={callPrefs.setPrefs}
                onPreview={callPrefs.preview}
              />
            </SidebarSection>
            <SidebarSection title="Saved facts" open={pane === "facts"} onToggle={() => toggle("facts")}>
              <SavedFacts
                facts={state.knownFacts}
                draft={session.draftFact}
                onDraft={session.setDraftFact}
                onAdd={session.addFact}
                onForget={session.forgetFact}
              />
            </SidebarSection>
            <SidebarSection
              title="This device"
              open={pane === "device"}
              onToggle={() => toggle("device")}
            >
              <MemoryActions
                adultMode={state.adultMode}
                importError={session.importError}
                onToggleAdult={session.toggleAdult}
                onExport={exportMemory}
                onImport={session.importMemory}
                onStartOver={session.startOver}
              />
            </SidebarSection>
          </aside>
        </div>
      ) : null}
    </>
  );
}
