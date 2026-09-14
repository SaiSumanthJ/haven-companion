"use client";

import { AgeGate } from "@/features/age-gate/AgeGate";
import { HavenRoom } from "@/features/chat/HavenRoom";
import { useHavenSession } from "@/features/chat/useHavenSession";
import { Setup } from "@/features/companion/Setup";

export function ChatApp() {
  const session = useHavenSession();

  if (!session.hydrated) {
    return <div className="min-h-full bg-[var(--haven-night)]" />;
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
