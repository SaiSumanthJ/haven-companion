"use client";

import { AgeGate } from "@/features/age-gate/AgeGate";
import { HavenMark } from "@/features/chat/HavenMark";
import { HavenRoom } from "@/features/chat/HavenRoom";
import { useHavenSession } from "@/features/chat/useHavenSession";
import { Setup } from "@/features/companion/Setup";

export function ChatApp() {
  const session = useHavenSession();

  if (!session.hydrated) {
    return (
      <main className="haven-room-enter mx-auto flex min-h-full w-full max-w-3xl items-start px-4 pt-8 sm:px-6">
        <HavenMark />
      </main>
    );
  }

  if (!session.state.ageVerified) {
    return <AgeGate onConfirm={session.confirmAge} />;
  }

  if (session.needsName) {
    return (
      <Setup
        defaultName={session.state.companionName}
        onStart={session.startWithName}
      />
    );
  }

  return <HavenRoom session={session} />;
}
